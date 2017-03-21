var crypto = require('crypto');

module.exports = function slowHash(data) {
  var shasum = crypto.createHash('sha512');
  shasum.update(data);
  hash = shasum.digest('hex');
  for (var i = 0; i < 100000; i++) {
    var shasum = crypto.createHash('sha512');
    shasum.update(hash);
    hash = shasum.digest('hex');
  }
  return hash;
};