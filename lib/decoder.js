const { Parser } = require("binary-parser");
const { crc16 } = require("crc");

class Decoder {
  constructor(avl) {
    this.avl = avl;

    this.gps = new Parser()
      .int32("longitude", { formatter: (d) => d * 0.0000001 })
      .int32("latitude", { formatter: (d) => d * 0.0000001 })
      .int16("altitude")
      .uint16("angle")
      .uint8("satellites")
      .uint16("speed");

    const codec12 = new Parser()
      .uint8("quantity1")
      .uint8("type")
      .choice(null, {
        tag: "type",
        choices: {
          0x5: Parser.start()
            .uint32("size")
            .string("command", { length: "size" }),
          0x6: Parser.start()
            .uint32("size")
            .string("response", {
              length: "size",
              formatter: (r) =>
                Array.from(
                  r.matchAll(
                    // id [:value] [,| id|$]
                    /(?<id>[A-Z](?:\s*[a-zA-Z0-9]+)*)\s*(?::\s*(?<value>.+?))?\s*(?=,|\s[A-Z]|$)/g
                  ),
                  ({ groups }) => {
                    const { id, value } = groups;
                    return { id, value: isNaN(value) ? value : Number(value) };
                  }
                ),
            }),
        },
      })
      .uint8("quantity2");

    const codec13 = new Parser()
      .uint8("commandQuantity1")
      .uint8("type")
      .uint32("commandSize")
      .uint32("timestamp", { formatter: (t) => new Date(t * 1000) })
      .string("command", { length: (obj) => obj.commandSize - 4 })
      .uint8("commandQuantity2");

    this.codec = new Parser()
      .uint32("preamble", { assert: 0 })
      .uint32("dataFieldLength")
      .saveOffset("dataFieldOffset")
      .uint8("codecId")
      .choice(null, {
        tag: "codecId",
        choices: {
          0x8: this.getCodecParser("uint8", "uint8"),
          0x8e: this.getCodecParser("uint16", "uint16", { variable: true }),
          0x10: this.getCodecParser("uint16", "uint8", { generation: true }),
          0x0c: codec12,
          0x0d: codec13,
        },
      })
      .uint32("crc16");
  }

  decode(buffer) {
    const result = this.codec.parse(buffer);
    const data = buffer.subarray(
      result.dataFieldOffset,
      result.dataFieldOffset + result.dataFieldLength
    );
    delete result.dataFieldOffset;
    if (crc16(data) != result.crc16) throw new Error("CRC-16 check failed");
    return result;
  }

  getCodecParser(type, countType, options) {
    return Parser.start()
      .uint8("count")
      .array("data", {
        length: "count",
        type: Parser.start()
          .uint64("timestamp", {
            formatter: (t) => new Date(Number(t)),
          })
          .uint8("priority")
          .nest("gps", { type: this.gps })
          .nest("io", { type: this.getIOParser(type, countType, options) }),
      })
      .uint8("count2", {
        assert(n) {
          return n == this.count;
        },
      });
  }

  getIOParser(
    type,
    countType,
    options = { generation: false, variable: false }
  ) {
    const elementsParser = Parser.start()
      [countType]("oneByteCount")
      .array("oneByte", {
        length: "oneByteCount",
        type: this.getIODataParser(type, "int8"),
      })
      [countType]("twoByteCount")
      .array("twoByte", {
        length: "twoByteCount",
        type: this.getIODataParser(type, "int16"),
      })
      [countType]("fourByteCount")
      .array("fourByte", {
        length: "fourByteCount",
        type: this.getIODataParser(type, "int32"),
      })
      [countType]("eightByteCount")
      .array("eightByte", {
        length: "eightByteCount",
        type: this.getIODataParser(type, "int64"),
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
      formatter: (d) => {
        const data = d.oneByte.concat(
          d.twoByte,
          d.fourByte,
          d.eightByte,
          d.variable || []
        );
        for (const d of data) {
          const info = this.avl.elements[d.id];
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

  getIODataParser(idType, valueType) {
    const decoder = this;
    return Parser.start()
      [idType]("id")
      .choice("value", {
        tag() {
          return decoder.avl.elements[this.id].type == "signed" ? 1 : 0;
        },
        choices: {
          0: Parser.start()[`u${valueType}`](),
          1: Parser.start()[valueType](),
        },
      });
  }
}

module.exports = Decoder;
