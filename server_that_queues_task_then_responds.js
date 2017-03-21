var http = require('http');
var url = require('url');
var slowHash = require('./slow_hash');
var redis = require('redis');

const PORT = 8080;
const REDIS_TASKS_QUEUE = 'tasks_queue';
const REDIS_RESULTS_QUEUE = 'results_queue';
const TASKS_INTERVAL = 100;

var client = redis.createClient();
client.on("error", function (err) {
  console.error("Redis client error ", err);
});

var server = http.createServer(function handleRequest(req, res) {
  var parsedUrl = url.parse(req.url);
  var data = parsedUrl.query.split('=')[1];
  client.lpush(REDIS_TASKS_QUEUE, data, function(err) {
    if (err) {
      console.error('Error pushing to %s', REDIS_TASKS_QUEUE, err);
      return res.send(500);
    }
    res.send(201);
  });
});

server.listen(PORT, function() {
  console.log("Server listening on: http://localhost:%s", PORT);
});


function checkForTask() {
  client.brpop(REDIS_TASKS_QUEUE, 0, function(err, data) {
    console.log('got task from %s', REDIS_TASKS_QUEUE);
    var hash = slowHash(data);
    client.lpush(REDIS_RESULTS_QUEUE, hash, function() {
      console.log('pushed result onto %s', REDIS_RESULTS_QUEUE);
      setTimeout(checkForTask, TASKS_INTERVAL);
    });
  });
}

setTimeout(checkForTask, TASKS_INTERVAL);