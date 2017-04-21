var dbRequests = require('./dbRequests');

module.exports.updateGraph = function(guild_id, author_id) {
  var response = [];
  return new Promise(function(resolve, reject) {
    dbRequests.fetchUserActivity(guild_id, author_id, 7, false, (err, res) => {
      if (err)
        return reject(err);
      response[0] = res;
    });
    dbRequests.fetchUserActivity(guild_id, author_id, 30, true, (err, res) => {
      if (err)
        return reject(err);
      response[1] = res;
      resolve(response);
    });
  });
}
