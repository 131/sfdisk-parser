[![Build Status](https://github.com/131/sfdisk-parser/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/131/sfdisk-parser/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/131/sfdisk-parser/badge.svg?branch=master)](https://coveralls.io/github/131/sfdisk-parser?branch=master)
[![Version](https://img.shields.io/npm/v/sfdisk-parser.svg)](https://www.npmjs.com/package/sfdisk-parser)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)
[![Code style](https://img.shields.io/badge/code%2fstyle-ivs-green.svg)](https://www.npmjs.com/package/eslint-plugin-ivs)


# Motivation 

This package provide a simple parser/serializer of sfdisk dumps. 

# API
## {metas, parts, toString} new SfdiskParser(sfdisk_dump_body);
## parts[2][name]= "System reserved somthing";


# Example usage

I was in need of the following API

```
const SfdiskParser = require('sfdisk-parser');
const somesfdiskdump_path = 'mysda.sf';

let sfstruct = new SfdiskParser(fs.readFileSync(somesfdiskdump_path, 'utf-8'));


let reserved = parsed.parts.pop(); //shift last part out of 4

parsed.parts.splice(2, 0, reserved); //put it back as 3rd

delete parsed.metas['last-lba']; //allow write on shorter disk

fs.writeFileSync(somesfdiskdump_path + "_reordered", sfstruct.toString());

```

# Credits
* [131](https://github.com/131)

