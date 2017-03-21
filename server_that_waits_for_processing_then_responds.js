var http = require('http');
var url = require('url');
var slowHash = require('./slow_hash');

const PORT = 8080;

var server = http.createServer(function handleRequest(req, res) {
  var parsedUrl = url.parse(req.url);
  var data = parsedUrl.query.split('=')[1];
  var hash = slowHash(data);
  res.end(hash);
});

server.listen(PORT, function() {
  console.log("Server listening on: http://localhost:%s", PORT);
});