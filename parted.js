"use strict";

class PartedParser {

  constructor(body) {
    this.parts = [];
    this.metas = {};

    let lines = body.split("\n"), line;
    while((line = lines.shift())) {
      let [k, v] = line.split(':');
      this.metas[k] = v.trim();
    }

    let col, head = lines.shift(), map = /([^\s].*?)(?:\s* {2}|$)/g;
    this.headers = [];

    while((col = map.exec(head)))
      this.headers.push({name : col[1], size : col[0].substr(-2) == "  " ? col[0].length : null});

    while((line = lines.shift())) {
      let pos = 0, attrs = {};
      for(let {name, size} of this.headers) {
        attrs[name] = line.substring(...([pos].concat(size ? [pos + size] : []))).trimEnd();
        pos += size;
      }
      this.parts.push(attrs);
    }
    this.first_sector = parseInt(this.parts[0].Start);
  }

  toString() {
    for(let head of this.headers)
      head.size = 0;


    for(let part of this.parts) {
      for(let head of this.headers)
        head.size = Math.max(head.name.length + 2, head.size, part[head.name].length + 2);

    }

    let ret = [];

    for(let [k, v] of Object.entries(this.metas))
      ret.push(`${k}: ${v}`);
    ret.push("");


    let line = "";
    for(let head of this.headers)
      line += head.name + " ".repeat(head.size - head.name.length);
    ret.push(line);


    //re-align sizes
    let pos = this.first_sector, i = 0;
    for(let part of this.parts) {

      part['Number'] = ` ${++i}`;

      let size  = parseInt(part.Size);

      if(pos == -1)
        pos = parseInt(part.Start);

      part.Start = `${pos}s`;
      part.End = `${pos + size - 1}s`;
      pos += size;
    }


    for(let part of this.parts) {
      let line = "";
      for(let head of this.headers)
        line += part[head.name] + " ".repeat(head.size - part[head.name].length);
      ret.push(line);
    }

    return ret.join('\n');

  }


}

module.exports = PartedParser;
