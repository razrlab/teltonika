import { deepEqual, equal, ok } from "assert/strict";

import { JSDOM } from "jsdom";
import fetch from "node-fetch";

function nameToVar(name) {
  return name
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

function testElement(element) {
  ok(Object.keys(element).length == 11);
  const {
    id,
    name,
    bytes,
    type,
    min,
    max,
    multiplier,
    unit,
    values,
    devices,
    groups,
  } = element;
  ok(Number.isInteger(id));
  ok(typeof name == "string" && name.trim().length);
  ok(Number.isInteger(bytes) || bytes === null);
  ok(
    (typeof type == "string" &&
      type.length &&
      !/\s/.test(type) &&
      type.toLowerCase() == type) ||
      type === null
  );
  ok(Number.isFinite(min) || min === null);
  ok(Number.isFinite(max) || max === null);
  ok(Number.isFinite(multiplier));
  ok((typeof unit == "string" && unit.trim().length) || unit === null);
  ok(
    Object.entries(values).every(
      ([k, v]) =>
        Number.isInteger(Number(k)) &&
        Number(k) >= 0 &&
        typeof v == "string" &&
        v.trim().length
    )
  );
  ok(Array.isArray(devices) && devices.every((d) => d.length && !/\s/.test(d)));
  ok(
    Array.isArray(groups) &&
      groups.every((g) => typeof g == "string" && g.trim().length)
  );
}

const prefixes = {
  Freezer: "Freezer",
  "Manual CAN": "Manual CAN",
  CAN: "CAN",
};

const nameFixes = {
  84: { "Fuel level": "Fuel Level Liters" },
  89: { "Fuel level": "Fuel Level Percent" },
  111: { "AdBlue Level": "AdBlue Level Percent" },
  112: { "AdBlue Level": "AdBlue Level Liters" },
  139: { "Driver 1 Driving Time": "Driver 1 Continuous Driving Time" },
  140: { "Driver 2 Driving Time": "Driver 2 Continuous Driving Time" },
  143: { "Driver 1 Acitivity Duratation": "Driver 1 Activity Duration" },
  144: { "Driver 2 Acitivity Duratation": "Driver 2 Activity Duration" },
  145: { "Driver 1 Driving Time": "Driver 1 Cumulative Driving Time" },
  146: { "Driver 2 Driving Time": "Driver 2 Cumulative Driving Time" },
  408: { "Driver Card Issue Year": "Driver Card Issue Year Long" },
  10354: { RPM: "RPM Percent" },
};

const urls = {
  general:
    "https://wiki.teltonika-gps.com/view/Template:Teltonika_Data_Sending_Parameters_ID",
  fmx640: "https://wiki.teltonika-gps.com/view/Template:FMX640_AVL_ID",
};

async function main() {
  const series = process.argv[2];
  const url = urls[series];
  if (!url) throw new Error(`Unknown series ${series}`);
  const { document } = new JSDOM(await (await fetch(url)).text()).window;
  const elements = {};
  const ids = {};
  for (const table of document.querySelectorAll("table")) {
    for (const row of table.querySelectorAll("tr")) {
      if (row.querySelector("th")) continue;
      const data = Array.from(row.querySelectorAll("td"), (c, i) =>
        c.querySelectorAll("a").length
          ? Array.from(c.querySelectorAll("a"), (a) => a.textContent).join("\n")
          : c.textContent.trim()
      );
      const id = Number(data[0]);
      let name = nameFixes[id]?.[data[1]] || data[1];
      const bytes = Number(data[2]) || null;
      const type =
        data[3] == "-"
          ? null
          : data[3].toLowerCase().replace("long int", "").trim();
      const min = data[4] == "-" ? null : Number(data[4]);
      const max = data[5] == "-" ? null : Number(data[5].replace(",", "."));
      const multiplier = parseFloat(data[6].replace(",", ".")) || 1;
      const unit = data[7] == "-" || !data[7].trim() ? null : data[7];
      let isSwappedValue = null;
      const rangeRegex = /^[0-9]+-[0-9]+$/;
      const values = Object.fromEntries(
        data[8]
          .split("\n")
          .map((l) => {
            const parts = l.split(/\s+[-\u2013]\s+/).map((p) => p.trim());
            if (parts.length != 2) return;
            if (isSwappedValue == null)
              isSwappedValue = /^[0-9]+$/.test(parts[1]);
            const numberIdx = isSwappedValue ? 1 : 0;
            const labelIdx = isSwappedValue ? 0 : 1;
            const isRange = rangeRegex.test(parts[numberIdx]);
            if (isRange) return [parts[numberIdx], parts[labelIdx]];
            const number = parseInt(parts[numberIdx].replace(/^if /, ""));
            if (isNaN(number)) return;
            const label = parts[labelIdx];
            return [number, label];
          })
          .filter(Boolean)
      );
      for (const [k, v] of Object.entries(values)) {
        if (rangeRegex.test(k)) {
          delete values[k];
          const [start, end] = k.split("-").map(Number);
          for (let i = start; i <= end; i++) values[i] = v;
        }
      }
      const devices = data[9]
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .sort();
      const groups = data[10]
        .split(",")
        .map((g) => g.trim())
        .sort();
      const group = Object.keys(prefixes).find((g) => groups[0].includes(g));
      if (group && !name.startsWith(prefixes[group]))
        name = `${prefixes[group]} ${name}`;
      const element = {
        id,
        name,
        bytes,
        type,
        min,
        max,
        multiplier,
        unit,
        values,
        devices,
        groups,
      };
      testElement(element);
      const nameId = nameToVar(name);
      if (nameId in ids) {
        equal(id, ids[nameId]);
      }
      ids[nameId] = id;
      if (id in elements) {
        let name, devices, groups, a, b;
        ({ name, devices, groups, ...a } = element);
        ({ name, devices, groups, ...b } = elements[id]);
        try {
          deepEqual(a, b);
        } catch (err) {
          if (!(id == 527 && name == "CAN DTC Value")) throw err;
        }
        if (element.name != elements[id].name)
          element.name = `${element.name} / ${elements[id].name}`;
        element.devices = Array.from(
          new Set([...element.devices, ...elements[id].devices])
        ).sort();
        element.groups = Array.from(
          new Set([...element.groups, ...elements[id].groups])
        ).sort();
      }
      elements[id] = element;
    }
  }
  elements[ids.GREEN_DRIVING_VALUE].multiplier = 0.01;
  console.log("// This file is automatically generated. Do not modify.");
  console.log(`module.exports.ids = ${JSON.stringify(ids, null, 2)};`);
  console.log();
  console.log(
    `module.exports.elements = ${JSON.stringify(elements, null, 2)};`
  );
}

main();
