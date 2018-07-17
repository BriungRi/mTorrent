const internalIp = require("internal-ip");
const mongoDriver = require('mongodb');
const mongoClient = mongoDriver.MongoClient;
const replSet = mongoDriver.replSet;
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
          adminDb.command({ replSetGetConfig: conf }, function(err, info) {
            console.log(info);
          });
        });
      }
    );
  },

  removeNodes: replSetName => {
    getReadyNodes(replSetName, function(nodes) {});
  },

  getAllHostnames: (replSetName, callback) => {
    mongoClient.connect(
      replSetToPortMapping[replSetName],
      function(err, db) {
        const adminDb = db.admin();
        const hostnames = [];
        adminDb.command({ replSetGetStatus: 1 }, function(err, status) {
          const members = status.members;
          members.forEach(function(member) {
            hostnames.push(members.name);
          });
          callback(hostnames);
        });
      }
    );
  },

  getReadyNodes: (replSetName, callback) => {
    mongoClient.connect(
      replSetToPortMapping[replSetName],
      function(err, db) {
        const adminDb = db.admin();
        const hostnames = [];
        adminDb.command({ replSetGetStatus: 1 }, function(err, status) {
          const members = status.members;
          members.forEach(function(member) {
            if (member.state == SECONDARY_STATE) hostnames.push(members.name);
          });
          callback(hostnames);
        });
      }
    );
  }
};
