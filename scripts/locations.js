const fs = require('fs');

async function crawl() {
  const locationsFile = fs.readFileSync('imports/locations.json');
  const locations = JSON.parse(locationsFile);

  const _locations = [];

  locations.map((province) => {
    _locations.push({
      id: province.Code,
      type: 'province',
      name: province.Name,
      fullName: province.FullName
    });

    province.District.map((district) => {
      _locations.push({
        id: district.Code,
        type: 'district',
        name: district.Name,
        fullName: district.FullName,
        parentId: province.Code,
      });

      district.Ward.map((ward) => {
        _locations.push({
          id: ward.Code,
          type: 'ward',
          name: ward.Name,
          fullName: ward.FullName,
          parentId: district.Code,
        });
      })
    })
  });

  fs.writeFileSync('src/locations/locations.data.json', JSON.stringify(_locations));
  console.log('Crawling locations done!');
}

crawl();