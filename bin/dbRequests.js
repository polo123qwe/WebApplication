var Connection = require('./dbConnection');

module.exports.fetchUserActivity = function(guild_id, user_id, time, monthSoFar, callback) {

  var db = Connection.getDB();
  if (!db)
    return callback("Not connected to DB!");

  //Variables used to decide the type of retrieval
  var date = new Date();
  var match = {};
  var grouping = {};
  match.author_id = user_id;
  match.guild_id = guild_id;
  if (time == 7) {
    grouping['$dayOfWeek'] = "$timestamp";
    match.timestamp = {
      "$gte": new Date(Date.now() - 24 * 7 * 3600000)
    };
  } else if (monthSoFar) {
    grouping['$dayOfMonth'] = "$timestamp";
    match.timestamp = {
      "$gte": new Date(date.getFullYear(), date.getUTCMonth(), 1, date.getTimezoneOffset() / -60)
    };
  } else {
    grouping['$dayOfMonth'] = "$timestamp";
    match.timestamp = {
      "$gte": new Date(Date.now() - 24 * time * 3600000)
    };
  }

  var collection = db.collection('logs');

  collection.aggregate([
    {
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
    }
  ], callback);
}
