const fs = require('fs');

function main() {
  const images = [];
  const imgExtensions = ['.png', '.jpg', '.svg'];
  const isImage = (file) => imgExtensions.some((ext) => file.includes(ext));

  const publicFiles = fs.readdirSync('public');
  publicFiles.map((file) => {
    if (isImage(file)) images.push(`/${file}`);
  });

  const appendImages = (path) => {
    const imageFiles = fs.readdirSync(`public${path}`);
    imageFiles.map((file) => {
      if (isImage(file)) images.push(`${path}/${file}`);
    });
  }
  
  appendImages('/images');
  appendImages('/images/auth-providers');
  appendImages('/lang');
  fs.writeFileSync('src/app.resource.json', JSON.stringify({ images }));
}

main()