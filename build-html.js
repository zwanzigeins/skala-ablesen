const fs = require('fs');

let src = 'src/index.html';
let dest = 'out/index.html';

fs.copyFile(src, dest, (err) => {
  if (err) throw err;
  console.log(src + ' was copied to ' + dest);
});