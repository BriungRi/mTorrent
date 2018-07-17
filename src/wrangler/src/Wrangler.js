const internalIp = require("internal-ip");
const mongoDriver = require('mongodb');
const mongoClient = mongoDriver.MongoClient;
const GridFSBucket = mongoDriver.Grid;
var portscanner = require("portscanner");
var exec = require("child_process").exec;
const replSetToPortMapping = {};
const SECONDARY_STATE = 2;
var fs = require('fs')

const makeMongod = (filename, callback) => {
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
  }

  const getIp = callback => {
    internalIp.v4().then(ip => {
      callback(ip);
    });
  }

  const addNode = (replSetName, mongoURL) => {
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
  }


const removeNodes = replSetName => {
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

  const getAllMembers = (replSetName, callback) => {
    mongoClient.connect(
      replSetToPortMapping[replSetName],
      function(err, db) {
        const adminDb = db.admin();
        adminDb.command({ replSetGetStatus: 1 }, function(err, status) {
          callback(status.members);
        });
      }
    );
  }

  const isReady = (db, iter, callback) => {
    const adminDb = db.admin();
    adminDb.command({ replSetGetStatus: 1 }, function(err, status) {
        if (status.myState == SECONDARY_STATE) {
            callback()
        } else {
            setTimeout(isReady(db, iter*2, callback), iter)
        }
    })
  }

  const downloadFile = (filename, callback) => {
      mongoClient.connect(
        replSetToPortMapping[replSetName],
        function(err, db) {
            var bucket = new GridFSBucket(db, {
                chunkSizeBytes: 1024,
                bucketName: 'songs'
            });
            var iter = 200;
            isReady(db, iter, function() {
                bucket.openDownloadStreamByName(filename)
                .start(0)
                .pipe(fs.createWriteStream('~/Downloads/'+filename))
                .on('error', () => {
                    console.log('error')
                }).on('finish', () => {
                    console.log('done')
                    callback()
                });
            })
        }
      )
  }

const getAllMembersByConfig = (replSetName, callback) => {
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

module.exports = {
    makeMongod: makeMongod,
    getIp: getIp,
    addNode: addNode,
    removeNodes: removeNodes,
    downloadFile: downloadFile,
    getAllMembersByConfig: getAllMembersByConfig
}



