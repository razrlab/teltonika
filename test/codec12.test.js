/** @typedef {import("zora").SpecFunction} SpecFunction */

const { codec } = require("..");

function print(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

/** @type {SpecFunction} */
function test1(t) {
  // https://wiki.teltonika-gps.com/view/Codec#Codec_12
  const hex = "000000000000000D0C010500000005676574696F01000000CB";
  const actual = codec.decode(Buffer.from(hex, "hex"));
  const expected = {
    preamble: 0,
    dataFieldLength: 13,
    codecId: 12,
    commandQuantity1: 1,
    type: 5,
    commandSize: 5,
    command: "getio",
    commandQuantity2: 1,
    crc16: 203,
  };
  t.deepEqual(actual, expected, "codec 12 is parsed correctly");
}

module.exports = test1;
