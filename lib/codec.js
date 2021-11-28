const { general: avl } = require("./avl");
const Decoder = require("./decoder");

const decoder = new Decoder(avl);

/** @type {typeof decoder.decode} */
module.exports.decode = decoder.decode.bind(decoder);
