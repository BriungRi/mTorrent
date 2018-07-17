const internalIp = require("internal-ip");
const mongoDriver = require('mongodb');
const mongoClient = mongoDriver.MongoClient;
const replSet = mongoDriver.replSet;
var portscanner = require("portscanner");
const replSetToPortMapping = {};

module.exports = {
  makeMongod: (filename, callback) => {
    const port = portscanner.findAPortNotInUse(
      3500,
      4001,
      "127.0.0.1",
      function(error, port) {
        console.log(port);
        exec(
          "./../bin/mongod --port " +
            port +
            ' --replSet "' +
            filename +
            '" --bind_ip_all'
        );
        replSetToPortMapping.filename = port;
        callback(port);
      }
    );
  },

  getIp: callback => {
    internalIp.v4().then(ip => {
      callback(ip);
    });
  },

  addNode: (replSetName, mongoURL) => {
    const dbName = "admin";
    const collectionName = "file";

    mongoClient.connect(
      replSetName,
      function(err, db) {
        var adminDb = db.admin();
        adminDb.command({ replSetGetConfig: 1 }, function(err, conf) {
          conf.members.push(mongoURL);
          adminDb.command({ replSetGetConfig: conf }, function(err, info) {
            console.log(info);
          });
        });
      }
    );
  },

  getServerList: (host, callback) => {

  }
};
