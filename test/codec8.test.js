/** @typedef {import("zora").SpecFunction} SpecFunction */

const { codec } = require("..");

function print(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

/** @type {SpecFunction} */
function test1(t) {
  // https://wiki.teltonika-gps.com/view/Codec#Codec_8
  const hex =
    "000000000000003608010000016B40D8EA30010000000000000000000000000000000105021503010101425E0F01F10000601A014E0000000000000000010000C7CF";
  const actual = codec.decode(Buffer.from(hex, "hex"));
  const expected = {
    preamble: 0,
    dataFieldLength: 54,
    codecId: 8,
    count: 1,
    data: [
      {
        timestamp: new Date(1560161086000),
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
              id: 21,
              value: 3,
            },
            {
              id: 1,
              value: 1,
            },
            {
              id: 66,
              value: 24.079,
            },
            {
              id: 241,
              value: 24602,
            },
            {
              id: 78,
              value: 0,
            },
          ],
        },
      },
    ],
    count2: 1,
    crc16: 51151,
  };
  t.deepEqual(actual, expected, "codec 8 is parsed correctly");
}

/** @type {SpecFunction} */
function test2(t) {
  // https://wiki.teltonika-gps.com/view/Codec#Codec_8
  const hex =
    "000000000000002808010000016B40D9AD80010000000000000000000000000000000103021503010101425E100000010000F22A";
  const actual = codec.decode(Buffer.from(hex, "hex"));
  const expected = {
    preamble: 0,
    dataFieldLength: 40,
    codecId: 8,
    count: 1,
    data: [
      {
        timestamp: new Date(1560161136000),
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
          count: 3,
          elements: [
            {
              id: 21,
              value: 3,
            },
            {
              id: 1,
              value: 1,
            },
            {
              id: 66,
              value: 24.080000000000002,
            },
          ],
        },
      },
    ],
    count2: 1,
    crc16: 61994,
  };
  t.deepEqual(actual, expected, "codec 8 is parsed correctly");
}

/** @type {SpecFunction} */
function test3(t) {
  // https://wiki.teltonika-gps.com/view/Codec#Codec_8
  const hex =
    "000000000000004308020000016B40D57B480100000000000000000000000000000001010101000000000000016B40D5C198010000000000000000000000000000000101010101000000020000252C";
  const actual = codec.decode(Buffer.from(hex, "hex"));
  const expected = {
    preamble: 0,
    dataFieldLength: 67,
    codecId: 8,
    count: 2,
    data: [
      {
        timestamp: new Date(1560160861000),
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
          count: 1,
          elements: [
            {
              id: 1,
              value: 0,
            },
          ],
        },
      },
      {
        timestamp: new Date(1560160879000),
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
          count: 1,
          elements: [
            {
              id: 1,
              value: 1,
            },
          ],
        },
      },
    ],
    count2: 2,
    crc16: 9516,
  };
  t.deepEqual(actual, expected, "codec 8 is parsed correctly");
}

module.exports = (t) => {
  test1(t);
  test2(t);
  test3(t);
};
