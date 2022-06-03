const { crc16 } = require("crc");

/** @param {string} command */
module.exports.encodeCommand = function encodeCommand(command) {
  // preamble + data size + codec id + command quantity 1 + type + command size +
  // command + command qty 2 + crc-16
  const size = 4 + 4 + 1 + 1 + 1 + 4 + command.length + 1 + 4;
  const dataSize = size - 12;

  const buf = new ArrayBuffer(size);
  const view = new DataView(buf);
  const encoder = new TextEncoder();

  let i = 0;

  // preamble
  view.setUint32(i, 0);
  i += 4;
  // data size
  view.setUint32(i, dataSize);
  i += 4;
  // codec id
  view.setUint8(i, 0x0c);
  ++i;
  // command qty 1
  view.setUint8(i, 0x1);
  ++i;
  // type
  view.setUint8(i, 0x5);
  ++i;
  // command size
  view.setUint32(i, command.length);
  i += 4;
  // command
  encoder.encodeInto(command, new Uint8Array(buf, i, command.length));
  i += command.length;
  // command qty 2
  view.setUint8(i, 0x1);
  ++i;
  // crc
  view.setUint32(i, crc16(new Uint8Array(buf, 8, dataSize)));

  return buf;
};
