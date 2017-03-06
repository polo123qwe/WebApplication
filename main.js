// app.js
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var d3 = require('d3');
var Connection = require('./bin/dbConnection');

app.use(express.static(__dirname + '/bower_components'));
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3002, function() {
    var host = server.address().address
    var port = server.address().port

    console.log("App listening at http://%s:%s", host, port);
    Connection((err, db) => {
        if (err) console.log(err)
        else {
            console.log("Connected to db!");
        }
    })
});

io.on('connection', function(client) {
    console.log('Client connected...');

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
        updateGraph(formData.guild_id, formData.author_id).then(data => {
            client.emit('update', data);
        }).catch(console.log);
    })

});

function updateGraph(guild_id, author_id) {
    return new Promise(function(resolve, reject) {
        fetchUserActivity(guild_id, author_id, 7, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
}

function fetchUserActivity(guild_id, user_id, time, callback) {

    var db = Connection.getDB();
    if (!db) return callback("Not connected to DB!");

    //Variables used to decide the type of retrieval
    var match = {};
    var grouping = {};
    match.author_id = user_id;
    match.guild_id = guild_id;
    if (time == 7) {
        grouping['$dayOfWeek'] = "$timestamp";
        match.timestamp = {
            "$gte": new Date(Date.now() - 24 * 7 * 3600000)
        };
    } else {
        grouping['$dayOfMonth'] = "$timestamp";
        match.timestamp = {
            "$gte": new Date(Date.now() - 24 * time * 3600000)
        };
    }

    var collection = db.collection('logs');

    collection.aggregate([{
        "$match": match
    }, {
        "$group": {
            _id: grouping,
            msgs: {
                $sum: 1
            }
        }
    }, {
        "$sort": {
            _id: 1
        }
    }], callback);
}
