const internalIp = require("internal-ip");
const mongoDriver = require("mongodb");
const mongoClient = mongoDriver.MongoClient;
const GridFSBucket = mongoDriver.GridFSBucket;
var portscanner = require("portscanner");
var exec = require("child_process").exec;
const replSetToPortMapping = {};
const SECONDARY_STATE = 2;
var fs = require("fs");
const request = require("request");
const server_url = require("../settings.js").server_url;

const makeMongod = (filename, callback) => {
  portscanner.findAPortNotInUse(3500, 4001, "127.0.0.1", function(error, port) {
    exec("mkdir -p ~/.data/torr/" + port, (error, stdout, stderr) => {
      exec(
        "src/bin/mongod --port " +
          port +
          ' --replSet "' +
          filename +
          '" --bind_ip_all' +
          " --dbpath " +
          "~/.data/torr/" +
          port +
          " --logpath ~/.data/torr/" +
          port +
          ".log --fork",
        (error1, stdout1, stderr1) => {
          getIp(function(privateIP) {
            replSetToPortMapping[filename] = privateIP + ":" + port;
            callback(port);
          });
        }
      );
    });
  });
};

const getIp = callback => {
  internalIp.v4().then(ip => {
    callback(ip);
  });
};

const addNode = (replSetName, mongoURL) => {
  console.log(replSetToPortMapping);
  console.log(replSetName);
  console.log(replSetToPortMapping[replSetName]);
  mongoClient.connect(
    replSetToPortMapping[replSetName],
    function(err, db) {
      if(err) {
        console.log(err);
      }
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
};

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
  getAllMembers = (replSetName, callback) => {
    mongoClient.connect(
      replSetToPortMapping[replSetName],
      function(err, db) {
        const adminDb = db.admin();
        adminDb.command({ replSetGetStatus: 1 }, function(err, status) {
          callback(status.members);
        });
      }
    );
  };

const isReady = (db, iter, callback) => {
  const adminDb = db.admin();
  adminDb.command({ replSetGetStatus: 1 }, function(err, status) {
    if (status.myState == SECONDARY_STATE) {
      callback();
    } else {
      setTimeout(isReady(db, iter * 2, callback), iter);
    }
  });
};

const downloadFile = (replSetName, callback) => {
  console.log(replSetToPortMapping);
  console.log(replSetName)
  console.log("Trying to download from: " + replSetToPortMapping[replSetName]);
  mongoClient.connect(
    replSetToPortMapping[replSetName],
    function(err, client) {
      const db = client.db();
      var bucket = new GridFSBucket(db, {
        chunkSizeBytes: 1024,
        bucketName: "songs"
      });
      var iter = 200;
      isReady(db, iter, function() {
        bucket
          .openDownloadStreamByName(filename)
          .start(0)
          .pipe(fs.createWriteStream("~/Downloads/" + filename))
          .on("error", () => {
            console.log("error");
          })
          .on("finish", () => {
            console.log("done");
            callback();
          });
      });
    }
  );
};

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
};

const uploadFileToMongo = (filename, filepath, db) => {
  var bucket = new GridFSBucket(db);
  fs.createReadStream(filepath)
    .pipe(bucket.openUploadStream(filename))
    .on("error", function(error) {
      console.log("Error");
      console.log(error);
    })
    .on("finish", function() {
      console.log("done!");
      getIp(function(privateIP) {
        request(
          {
            url: server_url + "upload",
            method: "POST",
            json: true,
            body: {
              filename: filename,
              ip: privateIP
            }
          },
          function(err, response) {
            if (err) {
              console.log("error in upload");
            } else {
              console.log("it's inside");
              console.log(response.body);
            }
          }
        );
      });
    });
};

const uploadFile = (filename, filepath) => {
  // Start a mongod
  getIp(function(ip) {
    makeMongod(filename, function(port) {
      console.log(ip + ":" + port);
      mongoClient.connect(
        "mongodb://" + ip + ":" + port,
        function(err, client) {
          const db = client.db();
          console.log(err);
          const config = {
            _id: filename,
            members: [{ _id: 0, host: ip + ":" + port }]
          };
          var adminDb = db.admin();
          adminDb.command({ replSetInitiate: config }, function(err, info) {
            console.log("err " + err);
            console.log("conf " + JSON.stringify(info));
            setTimeout(uploadFileToMongo, 5000, filename, filepath, db); // TODO: Use an event handler
          });
        }
      );
    });
  });
  // Create a replica set
  // Add file to the replica set we created
  // Post to the the server upload route
  // Add to the wrangler map
};

module.exports = {
  makeMongod: makeMongod,
  getIp: getIp,
  addNode: addNode,
  removeNodes: removeNodes,
  downloadFile: downloadFile,
  getAllMembersByConfig: getAllMembersByConfig,
  uploadFile: uploadFile
};
