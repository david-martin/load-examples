var cluster = require('cluster');
var http = require('http');
var url = require('url');
var slowHash = require('./slow_hash');

const PORT = 8080;
const NUM_WORKERS = process.env.NUM_WORKERS || 2;
var fhComponentMetrics = require('fh-component-metrics');
var metricsConf = {enabled: true, host: 'localhost', port: 8087};
var metrics = fhComponentMetrics(metricsConf);

var TITLE = 'load-example';

if (cluster.isMaster) { // fork worker threads
  for (i = 0; i < NUM_WORKERS; i += 1) {
    console.log('Starting worker #' + i);
    cluster.fork();
  }
} else {
  process.env.metricsId = cluster.worker.id;
  metrics.memory(TITLE, { interval: 2000 }, function(err) {
    if (err) console.warn(err);
  });

  metrics.cpu(TITLE, { interval: 1000 }, function(err) {
    if (err) console.warn(err);
  });

  var server = http.createServer(function handleRequest(req, res) {
    console.log('Worker %s handling request', cluster.worker.id);
    var parsedUrl = url.parse(req.url);
    var data = parsedUrl.query.split('=')[1];
    var start = Date.now();
    var hash = slowHash(data);
    var time = Date.now() - start;
    metrics.gauge(TITLE, {success: function() {}, fn: 'slowHash'}, time);
    res.end(hash);
  });
  server.listen(PORT, function() {
    console.log("Server worker %s listening on: http://localhost:%s", cluster.worker.id, PORT);
  });
}

