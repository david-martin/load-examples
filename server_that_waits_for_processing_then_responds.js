var http = require('http');
var url = require('url');
var slowHash = require('./slow_hash');
var fhComponentMetrics = require('fh-component-metrics');
var metricsConf = {enabled: true, host: 'localhost', port: 8087};
var metrics = fhComponentMetrics(metricsConf);

var TITLE = 'load-example';

metrics.memory(TITLE, { interval: 2000 }, function(err) {
  if (err) console.warn(err);
});

metrics.cpu(TITLE, { interval: 1000 }, function(err) {
  if (err) console.warn(err);
});


const PORT = 8080;

var server = http.createServer(function handleRequest(req, res) {
  var parsedUrl = url.parse(req.url);
  var data = parsedUrl.query.split('=')[1];
  var start = Date.now();
  var hash = slowHash(data);
  var time = Date.now() - start;
  metrics.gauge(TITLE, {success: function() {}, fn: 'slowHash'}, time);
  res.end(hash);
});

server.listen(PORT, function() {
  console.log("Server listening on: http://localhost:%s", PORT);
});