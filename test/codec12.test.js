/** @typedef {import("zora").ISpecFunction} ISpecFunction */

const { test } = require("zora");

const { codec, codec12 } = require("..");

function print(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

/** @type {ISpecFunction} */
function testCommand(t) {
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
  t.deepEqual(actual, expected, "codec 12 command is parsed correctly");
}

/** @type {ISpecFunction} */
function testGetIOResponse(t) {
  // https://wiki.teltonika-gps.com/view/FMB_getio
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
  t.deepEqual(actual, expected, "codec 12 getio response is parsed correctly");
}

/** @type {ISpecFunction} */
function testGetInfoResponse(t) {
  // https://wiki.teltonika-gps.com/view/FMB_getinfo
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
    "codec 12 getinfo response is parsed correctly"
  );
}

/** @type {ISpecFunction} */
function testGetStatusResponse(t) {
  // https://wiki.teltonika-gps.com/view/FMB_getstatus
  const hex =
    "00000000000000880C01060000008044617461204C696E6B3A203020475052533A20312050686F6E653A20302053494D3A2030204F503A203234363032205369676E616C3A2035204E6577534D533A203020526F616D696E673A203020534D5346756C6C3A2030204C41433A20312043656C6C2049443A2033303535204E6574547970653A20332046775570643A30010000941A";
  const actual = codec.decode(Buffer.from(hex, "hex"));
  const expected = {
    preamble: 0,
    dataFieldLength: 136,
    codecId: 12,
    quantity1: 1,
    type: 6,
    size: 128,
    response: [
      { id: "Data Link", value: 0 },
      { id: "GPRS", value: 1 },
      { id: "Phone", value: 0 },
      { id: "SIM", value: 0 },
      { id: "OP", value: 24602 },
      { id: "Signal", value: 5 },
      { id: "NewSMS", value: 0 },
      { id: "Roaming", value: 0 },
      { id: "SMSFull", value: 0 },
      { id: "LAC", value: 1 },
      { id: "Cell ID", value: 3055 },
      { id: "NetType", value: 3 },
      { id: "FwUpd", value: 0 },
    ],
    quantity2: 1,
    crc16: 37914,
  };
  t.deepEqual(
    actual,
    expected,
    "codec 12 getstatus response is parsed correctly"
  );
}

/** @type {ISpecFunction} */
function testOBDInfoResponse(t) {
  // https://wiki.teltonika-gps.com/view/FMB_obdinfo
  const hex =
    "00000000000000610C01060000005950726F743A302C56494E3A4E2F412C544D3A31302C434E543A302C53543A4F46462C50313A3078302C50323A3078302C50333A3078302C50343A3078302C4D494C3A302C4454433A302C4944302C4864723A302C5068793A30010000FC5F";
  const actual = codec.decode(Buffer.from(hex, "hex"));
  const expected = {
    preamble: 0,
    dataFieldLength: 97,
    codecId: 12,
    quantity1: 1,
    type: 6,
    size: 89,
    response: [
      { id: "Prot", value: 0 },
      { id: "VIN", value: "N/A" },
      { id: "TM", value: 10 },
      { id: "CNT", value: 0 },
      { id: "ST", value: "OFF" },
      { id: "P1", value: 0 },
      { id: "P2", value: 0 },
      { id: "P3", value: 0 },
      { id: "P4", value: 0 },
      { id: "MIL", value: 0 },
      { id: "DTC", value: 0 },
      { id: "ID0", value: undefined },
      { id: "Hdr", value: 0 },
      { id: "Phy", value: 0 },
    ],
    quantity2: 1,
    crc16: 64607,
  };
  t.deepEqual(
    actual,
    expected,
    "codec 12 obdinfo response is parsed correctly"
  );
}

/** @type {ISpecFunction} */
function testNewValueResponse(t) {
  const hex =
    "00000000000000400c0106000000384e65772076616c75652033303030303a383045333332464546333446303232363b33303030313a334132383234463341363738353238423b01000049b5";
  const actual = codec.decode(Buffer.from(hex, "hex"));
  const expected = {
    preamble: 0,
    dataFieldLength: 64,
    codecId: 12,
    quantity1: 1,
    type: 6,
    size: 56,
    response: [
      {
        id: "New value",
        value: "30000:80E332FEF34F0226;30001:3A2824F3A678528B;",
      },
    ],
    quantity2: 1,
    crc16: 18869,
  };
  t.deepEqual(
    actual,
    expected,
    "codec 12 new value response is parsed correctly"
  );
}

/** @type {ISpecFunction} */
function testParamResponse(t) {
  const hex =
    "000000000000001f0c010600000017506172616d2049443a323030312056616c75653a7761700100003548";
  const actual = codec.decode(Buffer.from(hex, "hex"));
  const expected = {
    preamble: 0,
    dataFieldLength: 31,
    codecId: 12,
    quantity1: 1,
    type: 6,
    size: 23,
    response: [
      { id: "Param ID", value: 2001 },
      { id: "Value", value: "wap" },
    ],
    quantity2: 1,
    crc16: 13640,
  };
  t.deepEqual(actual, expected, "codec 12 param response is parsed correctly");
}

/** @type {ISpecFunction} */
function testWarningResponse(t) {
  const hex =
    "00000000000000390c0106000000315741524e494e473a204e6f7420737570706f7274656420506172616d204944206f722056616c75652064657465637465640100008f01";
  const actual = codec.decode(Buffer.from(hex, "hex"));
  const expected = {
    codecId: 12,
    crc16: 36609,
    dataFieldLength: 57,
    preamble: 0,
    quantity1: 1,
    quantity2: 1,
    response: [
      {
        id: "WARNING",
        value: "Not supported Param ID or Value detected",
      },
    ],
    size: 49,
    type: 6,
  };
  t.deepEqual(
    actual,
    expected,
    "codec 12 warning response is parsed correctly"
  );
}

/** @type {ISpecFunction} */
function testEncodeCommand(t) {
  const command = "setparam 30000:80e332fef34f0226;30001:3a2824f3a678528b";
  const encoded = Buffer.from(codec12.encodeCommand(command));
  const hex =
    "000000000000003e0c010500000036736574706172616d2033303030303a383065333332666566333466303232363b33303030313a336132383234663361363738353238620100004411";
  t.deepEqual(encoded.toString("hex"), hex);
  t.deepEqual(codec.decode(encoded), {
    codecId: 12,
    command: "setparam 30000:80e332fef34f0226;30001:3a2824f3a678528b",
    crc16: 17425,
    dataFieldLength: 62,
    preamble: 0,
    quantity1: 1,
    quantity2: 1,
    size: 54,
    type: 5,
  });
}

test("codec12", (t) => {
  testCommand(t);
  testGetIOResponse(t);
  testGetInfoResponse(t);
  testGetStatusResponse(t);
  testOBDInfoResponse(t);
  testNewValueResponse(t);
  testParamResponse(t);
  testWarningResponse(t);
  testEncodeCommand(t);
});
