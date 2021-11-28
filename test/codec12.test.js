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
    quantity1: 1,
    type: 5,
    size: 5,
    command: "getio",
    quantity2: 1,
    crc16: 203,
  };
  t.deepEqual(actual, expected, "codec 12 is parsed correctly");
}

function test2(t) {
  const hex =
    "00000000000000370C01060000002F4449313A31204449323A30204449333A302041494E313A302041494E323A313639323420444F313A3020444F323A3101000066E3";
  const actual = codec.decode(Buffer.from(hex, "hex"));
  const expected = {
    preamble: 0,
    dataFieldLength: 55,
    codecId: 12,
    quantity1: 1,
    type: 6,
    size: 47,
    response: [
      { id: "DI1", value: 1 },
      { id: "DI2", value: 0 },
      { id: "DI3", value: 0 },
      { id: "AIN1", value: 0 },
      { id: "AIN2", value: 16924 },
      { id: "DO1", value: 0 },
      { id: "DO2", value: 1 },
    ],
    quantity2: 1,
    crc16: 26339,
  };
  t.deepEqual(actual, expected, "codec 12 response is parsed correctly");
}

function test3(t) {
  const hex =
    "000000000000009E0C0106000000965254433A323031372F362F313620373A313320496E69743A323031372F362F313620353A343420557054696D653A3437343473205057523A507772566F6C74616765205253543A30204750533A31205341543A3020545446463A302054544C463A30204E4F4750533A20313A31382053523A302046473A32303020464C3A3020534D533A33205245433A3432204D443A312044423A3001000042EA";
  const actual = codec.decode(Buffer.from(hex, "hex"));
  const expected = {
    preamble: 0,
    dataFieldLength: 158,
    codecId: 12,
    quantity1: 1,
    type: 6,
    size: 150,
    response: [
      { id: "RTC", value: "2017/6/16 7:13" },
      { id: "Init", value: "2017/6/16 5:44" },
      { id: "UpTime", value: "4744s" },
      { id: "PWR", value: "PwrVoltage" },
      { id: "RST", value: 0 },
      { id: "GPS", value: 1 },
      { id: "SAT", value: 0 },
      { id: "TTFF", value: 0 },
      { id: "TTLF", value: 0 },
      { id: "NOGPS", value: "1:18" },
      { id: "SR", value: 0 },
      { id: "FG", value: 200 },
      { id: "FL", value: 0 },
      { id: "SMS", value: 3 },
      { id: "REC", value: 42 },
      { id: "MD", value: 1 },
      { id: "DB", value: 0 },
    ],
    quantity2: 1,
    crc16: 17130,
  };
  t.deepEqual(
    actual,
    expected,
    "codec 12 complex response is parsed correctly"
  );
}

module.exports = (t) => {
  test1(t);
  test2(t);
  test3(t);
};
