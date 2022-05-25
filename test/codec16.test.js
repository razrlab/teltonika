/** @typedef {import("zora").ISpecFunction} ISpecFunction */

const { test } = require("zora");

const { codec } = require("..");

function print(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

/** @type {ISpecFunction} */
function test1(t) {
  // https://wiki.teltonika-gps.com/view/Codec#Codec_16
  const hex =
    "000000000000005F10020000016BDBC7833000000000000000000000000000000000000B05040200010000030002000B00270042563A00000000016BDBC7871800000000000000000000000000000000000B05040200010000030002000B00260042563A00000200005FB3";
  const actual = codec.decode(Buffer.from(hex, "hex"));
  const expected = {
    preamble: 0,
    dataFieldLength: 95,
    codecId: 16,
    count: 2,
    data: [
      {
        timestamp: new Date(1562760414000),
        priority: 0,
        gps: {
          longitude: 0,
          latitude: 0,
          altitude: 0,
          angle: 0,
          satellites: 0,
          speed: 0,
        },
        io: {
          eventId: 11,
          generationType: 5,
          count: 4,
          elements: [
            {
              id: 1,
              value: 0,
            },
            {
              id: 3,
              value: 0,
            },
            {
              id: 11,
              value: 39,
            },
            {
              id: 66,
              value: 22.074,
            },
          ],
        },
      },
      {
        timestamp: new Date(1562760415000),
        priority: 0,
        gps: {
          longitude: 0,
          latitude: 0,
          altitude: 0,
          angle: 0,
          satellites: 0,
          speed: 0,
        },
        io: {
          eventId: 11,
          generationType: 5,
          count: 4,
          elements: [
            {
              id: 1,
              value: 0,
            },
            {
              id: 3,
              value: 0,
            },
            {
              id: 11,
              value: 38,
            },
            {
              id: 66,
              value: 22.074,
            },
          ],
        },
      },
    ],
    count2: 2,
    crc16: 24499,
  };
  t.deepEqual(actual, expected, "codec 16 is parsed correctly");
}

test("codec16", test1);
