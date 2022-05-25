/** @typedef {import("zora").ISpecFunction} ISpecFunction */

const { test } = require("zora");

const { codec } = require("..");

function print(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

/** @type {ISpecFunction} */
function test1(t) {
  // https://wiki.teltonika-gps.com/view/Codec#Codec_13
  const hex = "00000000000000130D01050000000B0A81C320676574696E666F010000ED9B";
  const actual = codec.decode(Buffer.from(hex, "hex"));
  const expected = {
    preamble: 0,
    dataFieldLength: 19,
    codecId: 13,
    commandQuantity1: 1,
    type: 5,
    commandSize: 11,
    timestamp: new Date(176276256 * 1000),
    command: "getinfo",
    commandQuantity2: 1,
    crc16: 60827,
  };
  t.deepEqual(actual, expected, "codec 13 is parsed correctly");
}

test("codec13", test1);
