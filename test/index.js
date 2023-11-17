"use strict";


const expect = require('expect.js');
const SfdiskParser  = require('..');

describe('sfdisk_parser', function() {
  it('should parse an empty string', function() {
    const result = new SfdiskParser('');
    expect(result.metas).to.eql({});
    expect(result.parts).to.eql([]);
  });

  it('should parse valid sfdisk data', function() {
    const sfdiskData = `label: gpt
label-id: B4FAC9D5-D44B-4C9A-AE0E-47574E783822
device: /dev/sda
unit: sectors
first-lba: 34
last-lba: 250069646
sector-size: 512

/dev/sda1: start= 2048, size= 729088, type=C12A7328-F81F-11D2-BA4B-00A0C93EC93B, uuid=4A1EC2D1-F182-442E-8F09-A6345A8F58CB, name="EFI system partition", attrs="GUID:63"`;

    const result = new SfdiskParser(sfdiskData);
    expect(result.metas).to.have.keys(['label', 'label-id', 'device', 'unit', 'first-lba', 'last-lba', 'sector-size']);
    expect(result.parts.length).to.be(1);
    expect(result.parts[0].start).to.eql('2048');
  });


  it("should remap properly", function() {
    const sfdiskDump = `label: gpt
label-id: B4FAC9D5-D44B-4C9A-AE0E-47574E783822
device: /dev/sda
unit: sectors
first-lba: 34
last-lba: 250069646
sector-size: 512

/dev/sda1 : start=        2048, size=      729088, type=C12A7328-F81F-11D2-BA4B-00A0C93EC93B, uuid=4A1EC2D1-F182-442E-8F09-A6345A8F58CB, name="EFI system partition", attrs="GUID:63"
/dev/sda2 : start=      731136, size=       32768, type=E3C9E316-0B5C-4DB8-817D-F92DF00215AE, uuid=E15F32B9-CC19-47AB-8B31-3B098BECBF81, name="Microsoft reserved partition", attrs="GUID:63"
/dev/sda3 : start=      763904, size=    67108864, type=EBD0A0A2-B9E5-4433-87C0-68B6B72699C7, uuid=B62B9EE3-0B23-4B70-B6B5-B9D1616D765E, name="Basic data partition"
/dev/sda4 : start=   247984128, size=     2083456, type=DE94BBA4-06D1-4D40-A16A-BFD50179D6AC, uuid=7A18B620-7FFF-4002-9B96-D83DC601163A, attrs="RequiredPartition GUID:63"
`;

    let sfstruct = new SfdiskParser(sfdiskDump);
    let reserved = sfstruct.parts.pop(); //shift last part out of 4
    sfstruct.parts.splice(2, 0, reserved); //put it back as 3rd
    delete sfstruct.metas['last-lba']; //allow write on shorter disk

    let fixed = sfstruct.toString();
    expect(fixed).to.eql(`label: gpt
label-id: B4FAC9D5-D44B-4C9A-AE0E-47574E783822
device: /dev/sda
unit: sectors
first-lba: 34
sector-size: 512

/dev/sda1 : start=2048, size=729088, type=C12A7328-F81F-11D2-BA4B-00A0C93EC93B, uuid=4A1EC2D1-F182-442E-8F09-A6345A8F58CB, name="EFI system partition", attrs="GUID:63"
/dev/sda2 : start=731136, size=32768, type=E3C9E316-0B5C-4DB8-817D-F92DF00215AE, uuid=E15F32B9-CC19-47AB-8B31-3B098BECBF81, name="Microsoft reserved partition", attrs="GUID:63"
/dev/sda3 : start=763904, size=2083456, type=DE94BBA4-06D1-4D40-A16A-BFD50179D6AC, uuid=7A18B620-7FFF-4002-9B96-D83DC601163A, attrs="RequiredPartition GUID:63"
/dev/sda4 : start=2847360, size=67108864, type=EBD0A0A2-B9E5-4433-87C0-68B6B72699C7, uuid=B62B9EE3-0B23-4B70-B6B5-B9D1616D765E, name="Basic data partition"
`);
  });


});
