var http = require('http');
var url = require('url');
var slowHash = require('./slow_hash');
var redis = require('redis');
var fhComponentMetrics = require('fh-component-metrics');
var metricsConf = {enabled: true, host: 'localhost', port: 8087};
var metrics = fhComponentMetrics(metricsConf);

const PORT = 8080;
const REDIS_TASKS_QUEUE = 'tasks_queue';
const REDIS_RESULTS_QUEUE = 'results_queue';
const TASKS_INTERVAL = 100;
const TITLE = 'load-example';

metrics.memory(TITLE, { interval: 2000 }, function(err) {
  if (err) console.warn(err);
});

metrics.cpu(TITLE, { interval: 1000 }, function(err) {
  if (err) console.warn(err);
});

var client = redis.createClient();
client.on("error", function (err) {
  console.error("Redis client error ", err);
});

var server = http.createServer(function handleRequest(req, res) {
  var start = Date.now();
  var parsedUrl = url.parse(req.url);
  var data = parsedUrl.query.split('=')[1];
  client.lpush(REDIS_TASKS_QUEUE, data, function(err) {
    if (err) {
      console.error('Error pushing to %s', REDIS_TASKS_QUEUE, err);
      res.statusCode = 500;
      return res.end();
    }
    res.statusCode = 202;
    var time = Date.now() - start;
    metrics.gauge(TITLE, {success: function() {}, fn: 'lpush'}, time);
    res.end();
  });
});

server.listen(PORT, function() {
  console.log("Server listening on: http://localhost:%s", PORT);
});


function checkForTask() {
  client.rpop(REDIS_TASKS_QUEUE, function(err, data) {
    if (err || !data) {
      if (err) {
        console.error('Error getting task from %s', REDIS_TASKS_QUEUE, err);
      }
      return setTimeout(checkForTask, TASKS_INTERVAL);
    }
    // console.log('got task from %s', REDIS_TASKS_QUEUE, err, data);
    var start = Date.now();
    var hash = slowHash(data);
    var time = Date.now() - start;
    metrics.gauge(TITLE, {success: function() {}, fn: 'slowHash'}, time);
    client.lpush(REDIS_RESULTS_QUEUE, hash, function() {
      // console.log('pushed result onto %s', REDIS_RESULTS_QUEUE);
      setTimeout(checkForTask, TASKS_INTERVAL);
    });
  });
}

setTimeout(checkForTask, TASKS_INTERVAL);