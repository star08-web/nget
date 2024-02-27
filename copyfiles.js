const copy = require('copy');
const path = require('path');
copy('src/webUI/**', 'dist/webUI/', function(err, files) {
  if (err) throw err;
  console.log("WebUI files copied to dist");
});