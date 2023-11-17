"use strict";

class SfdiskParser {

  constructor(body) {
    this.parts = [];
    this.metas = {};

    let lines = body.split("\n"), line;
    while((line = lines.shift())) {
      let [k, v] = line.split(':');
      this.metas[k] = v.trim();
    }

    while((line = lines.shift())) {
      let [, , part] = /(^.*?)\s*:\s*(.*)/.exec(line.trim());
      let parsed = SfdiskParser.parsePart(part);
      this.parts.push(parsed);
    }
  }

  toString() {

    let ret = [];
    for(let [k, v] of Object.entries(this.metas))
      ret.push(`${k}: ${v}`);
    ret.push("");

    let i = 0;

    let pos = -1;
    for(let part of this.parts) {

      let rline = `${this.metas['device']}${++i} : `;

      let size  = parseInt(part.size);

      if(pos == -1)
        pos = parseInt(part.start);

      part.start = pos;

      let val = (v) => /[:,\s"']+/.test(v) ? `"${v}"` : v;
      rline += Object.entries(part).map(([k, v]) => `${k}=${val(v)}`).join(', ');
      ret.push(rline);
      pos += size;
    }
    ret.push("");
    return ret.join("\n");
  }

  static parsePart(str) {
    const mask = "([a-z]+)\\s*=\\s*(?:([^,\\s\\\"']+)|\\\"([^\\\"]*)\\\"|'([^']*)')|\\s*(,)\\s*";

    var r = new RegExp(mask, "g");
    var args = {}, step;

    while((step = r.exec(str || ""))) {
      let sep   = step[5] !== undefined;
      if(sep)
        continue;

      let key   = step[1];
      let value = step[2] || step[3] || step[4] || "";

      args[key] = value;
    }

    return args;
  }

}

module.exports = SfdiskParser;
