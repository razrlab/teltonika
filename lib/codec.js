const { general: avl } = require("./avl");
const Decoder = require("./decoder");

const decoder = new Decoder(avl);

module.exports.decode = function decode(buffer) {
  return decoder.decode(buffer);
};
