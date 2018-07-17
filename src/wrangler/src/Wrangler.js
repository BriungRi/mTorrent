const internalIp = require("internal-ip");
const mongoDriver = require("mongodb");
const mongoClient = mongoDriver.MongoClient;
var portscanner = require("portscanner");
const replSetToPortMapping = {};
const SECONDARY_STATE = 2;

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
    mongoClient.connect(
      replSetToPortMapping[replSetName],
      function(err, db) {
        var adminDb = db.admin();
        adminDb.command({ replSetGetConfig: 1 }, function(err, conf) {
          conf.members.push(mongoURL);
          adminDb.command({ replSetSetConfig: conf }, function(err, info) {
            console.log("Adding node");
            console.log(info);
          });
        });
      }
    );
  },

  removeNodes: replSetName => {
    getAllMembers(replSetName, function(members) {
      const readyMemberNames = new Set([]);
      members.forEach(function(member) {
        if (member.status == SECONDARY_STATE) readyMemberNames.add(member.name);
      });
      getAllMembersByConfig(replSetName, function(members) {
        const newMembers = [];
        members.forEach(function(member) {
          if (!readyMemberNames.has(member.host)) newMembers.push(member);
        });
        adminDb.command({ replSetSetConfig: conf }, function(err, info) {
          console.log("Removing nodes");
          console.log(info);
        });
      });
    });
  },

  getAllMembers: (replSetName, callback) => {
    mongoClient.connect(
      replSetToPortMapping[replSetName],
      function(err, db) {
        const adminDb = db.admin();
        adminDb.command({ replSetGetStatus: 1 }, function(err, status) {
          callback(members);
        });
      }
    );
  },

  getAllMembersByConfig: (replSetName, callback) => {
    mongoClient.connect(
      replSetToPortMapping[replSetName],
      function(err, db) {
        const adminDb = db.admin();
        adminDb.command({ replSetGetConfig: 1 }, function(err, config) {
          callback(config.members);
        });
      }
    );
  }
};
