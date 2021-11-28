/**
 * @typedef AVL
 * @prop {Record<string, number>} ids
 * @prop {Record<number, { id: number; name: string; bytes: number | null; type: string | null; min: number | null; max: number | null; multiplier: number; unit: string | null; values: Record<number, string>; devices: string[]; groups: string[]; }>} elements
 */

module.exports.fmx640 = require("./fmx640");
module.exports.general = require("./general");
