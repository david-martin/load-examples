var cluster = require('cluster');
var http = require('http');
var url = require('url');
var slowHash = require('./slow_hash');

const PORT = 8080;
const NUM_WORKERS = process.env.NUM_WORKERS || 2;

if (cluster.isMaster) { // fork worker threads
  for (i = 0; i < NUM_WORKERS; i += 1) {
    console.log('Starting worker #' + i);
    cluster.fork();
  }
} else {
  var server = http.createServer(function handleRequest(req, res) {
    console.log('Worker %s handling request', cluster.worker.id);
    var parsedUrl = url.parse(req.url);
    var data = parsedUrl.query.split('=')[1];
    var hash = slowHash(data);
    res.end(hash);
  });
  server.listen(PORT, function() {
    console.log("Server worker %s listening on: http://localhost:%s", cluster.worker.id, PORT);
  });
}

