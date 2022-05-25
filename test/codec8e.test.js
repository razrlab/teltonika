/** @typedef {import("zora").ISpecFunction} ISpecFunction */

const { test } = require("zora");

const { codec } = require("..");

function print(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

/** @type {ISpecFunction} */
function test1(t) {
  // https://wiki.teltonika-gps.com/view/Codec#Codec_8_Extended
  const hex =
    "000000000000004A8E010000016B412CEE000100000000000000000000000000000000010005000100010100010011001D00010010015E2C880002000B000000003544C87A000E000000001DD7E06A00000100002994";
  const actual = codec.decode(Buffer.from(hex, "hex"));
  const expected = {
    preamble: 0,
    dataFieldLength: 74,
    codecId: 142,
    count: 1,
    data: [
      {
        timestamp: new Date(1560166592000),
        priority: 1,
        gps: {
          longitude: 0,
          latitude: 0,
          altitude: 0,
          angle: 0,
          satellites: 0,
          speed: 0,
        },
        io: {
          eventId: 1,
          count: 5,
          elements: [
            {
              id: 1,
              value: 1,
            },
            {
              id: 17,
              value: 29,
            },
            {
              id: 16,
              value: 22949000,
            },
            {
              id: 11,
              value: 893700218,
            },
            {
              id: 14,
              value: 500686954,
            },
          ],
        },
      },
    ],
    count2: 1,
    crc16: 10644,
  };
  t.deepEqual(actual, expected, "codec 8e is parsed correctly");
}

test("codec8e", test1);
