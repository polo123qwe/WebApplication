var MongoClient = require("mongodb").MongoClient;
var dboptions = require('../config.json');

var Connection;

var url = `mongodb://${dboptions.username}:${dboptions.password}@${dboptions.host}:${dboptions.port}/`;
var db = null;

function Connection(callback) {
	MongoClient.connect(url, (err, database) => {
                if (err) {
                    return callback(err);
                } else {
                    db = database.db(dboptions.db);
                    return callback(null, database);
                }
            });
		}

Connection.getDB = function() {
if (db) {
	return db;
} else {
	//console.log("Not connected to the db!");
	return null;
}
}

module.exports = Connection;
