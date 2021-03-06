// app.js
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var d3 = require('d3');
var Connection = require('./bin/dbConnection');
var dbRequests = require('./bin/dbRequests');
var reloadData = require('./bin/reloadData');

var clientAmount = 0;

app.use(express.static(__dirname + '/bower_components'));
app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(3002, function() {
  var host = server.address().address
  var port = server.address().port

  console.log("App listening at http://%s:%s", host, port);
  Connection((err, db) => {
    if (err)
      console.log(err)
    else {
      console.log("Connected to db!");
    }
  })
});

io.on('connection', function(client) {
  clientAmount++;
  console.log(`Client connected... (${clientAmount})`);

  client.on('join', function(data) {

    // client.emit('broad', io.engine.clientsCount);
    // client.broadcast.emit('broad', io.engine.clientsCount);
    // client.emit('broad', updateGraph(data));
    // client.broadcast.emit('broad', updateGraph());
  });

  client.on('messages', function(data) {
    //client.emit('broad', data);
    //client.broadcast.emit('broad',data);
    //console.log(io.engine.clientsCount)
    client.broadcast.emit('broad', io.engine.clientsCount);
  });

  client.on('formupdate', function(formData) {
    reloadData.updateGraph(formData.guild_id, formData.author_id).then(data => {
      if (data.length == 0) {
        formData.error = "No data found!";
        client.emit('err', formData);
      } else {
        client.emit('update', data);
      }
    }).catch(console.log);
  });

  client.on('disconnect', function(client) {
    console.log('Client disconnected');
    clientAmount--;
  });

});
