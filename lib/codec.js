const { Parser } = require("binary-parser");
const { crc16 } = require("crc");

const avl = require("./avl");

function getIODataParser(idType, valueType) {
  return Parser.start()
    [idType]("id")
    .choice("value", {
      tag: function () {
        return avl.elements[this.id].type == "signed" ? 1 : 0;
      },
      choices: {
        0: Parser.start()[`u${valueType}`](),
        1: Parser.start()[valueType](),
      },
    });
}

function getIOParser(
  type,
  countType,
  options = { generation: false, variable: false }
) {
  const elementsParser = Parser.start()
    [countType]("oneByteCount")
    .array("oneByte", {
      length: "oneByteCount",
      type: getIODataParser(type, "int8"),
    })
    [countType]("twoByteCount")
    .array("twoByte", {
      length: "twoByteCount",
      type: getIODataParser(type, "int16"),
    })
    [countType]("fourByteCount")
    .array("fourByte", {
      length: "fourByteCount",
      type: getIODataParser(type, "int32"),
    })
    [countType]("eightByteCount")
    .array("eightByte", {
      length: "eightByteCount",
      type: getIODataParser(type, "int64"),
    });

  if (options.variable)
    elementsParser[countType]("variableCount").array("variable", {
      length: "variableCount",
      type: Parser.start()[type]("id")[type]("length").buffer("value", {
        length: "length",
      }),
    });

  const ioParser = Parser.start()[type]("eventId");

  if (options.generation) ioParser.uint8("generationType");

  return ioParser[countType]("count").nest("elements", {
    type: elementsParser,
    formatter: function (d) {
      const data = d.oneByte.concat(
        d.twoByte,
        d.fourByte,
        d.eightByte,
        d.variable || []
      );
      for (const d of data) {
        const info = avl.elements[d.id];
        if (info.type == "signed" || info.type == "unsigned") {
          let isBigInt = typeof d.value == "bigint";
          if (isBigInt && !Number.isInteger(info.multiplier)) {
            d.value = Number(d.value);
            isBigInt = false;
          }
          d.value *= isBigInt ? BigInt(info.multiplier) : info.multiplier;
          if (isBigInt) {
            const num = Number(d.value);
            if (Number.isSafeInteger(num)) d.value = num;
          }
        }
      }
      return data;
    },
  });
}

const gps = new Parser()
  .int32("longitude", { formatter: (d) => d * 0.0000001 })
  .int32("latitude", { formatter: (d) => d * 0.0000001 })
  .int16("altitude")
  .uint16("angle")
  .uint8("satellites")
  .uint16("speed");

function getCodecParser(type, countType, options) {
  return Parser.start()
    .uint8("count")
    .array("data", {
      length: "count",
      type: Parser.start()
        .uint64("timestamp", {
          formatter: (t) => {
            const num = Number(t);
            return Number.isSafeInteger(num) ? num : t;
          },
        })
        .uint8("priority")
        .nest("gps", { type: gps })
        .nest("io", { type: getIOParser(type, countType, options) }),
    })
    .uint8("count2", {
      assert: function (n) {
        return n == this.count;
      },
    });
}

const codec12 = new Parser()
  .uint8("commandQuantity1")
  .uint8("type")
  .uint32("commandSize")
  .string("command", { length: "commandSize" })
  .uint8("commandQuantity2");

const codec13 = new Parser()
  .uint8("commandQuantity1")
  .uint8("type")
  .uint32("commandSize")
  .uint32("timestamp")
  .string("command", { length: (obj) => obj.commandSize - 4 })
  .uint8("commandQuantity2");

const codec = new Parser()
  .uint32("preamble", { assert: 0 })
  .uint32("dataFieldLength")
  .saveOffset("dataFieldOffset")
  .uint8("codecId")
  .choice(null, {
    tag: "codecId",
    choices: {
      0x8: getCodecParser("uint8", "uint8"),
      0x8e: getCodecParser("uint16", "uint16", { variable: true }),
      0x10: getCodecParser("uint16", "uint8", { generation: true }),
      0x0c: codec12,
      0x0d: codec13,
    },
  })
  .uint32("crc16");

// For testing
module.exports.parser = codec;

module.exports.decode = function (buffer) {
  const result = codec.parse(buffer);
  const data = buffer.subarray(
    result.dataFieldOffset,
    result.dataFieldOffset + result.dataFieldLength
  );
  delete result.dataFieldOffset;
  if (crc16(data) != result.crc16) throw new Error("CRC-16 check failed");
  return result;
};
