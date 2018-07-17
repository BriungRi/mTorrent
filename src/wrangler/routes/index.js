const mongoDriver = require("mongodb");
const mongoClient = mongoDriver.MongoClient;
const server_url = "http://localhost" || require("../settings").server_url;
const { makeMongod, getIp, addNode, removeNodes, downloadFile, getAllMembersByConfig } = require("../src/Wrangler");  
var express = require("express");
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/add_node", function(req, res, next) {
  console.log("adding node");
  console.log(req.body);
  console.log(req.body.hi);
  makeMongod("test3", function(port) {
    console.log(port)
  });
  res.send("ok");
});

router.post("/remove_nodes", function(req, res, next) {
  console.log("removing nodes");
  res.send("ok");
});

router.post('/download', function(req, res, next) {
  // send request to server to get added to replica set
  getIp(function(ip) {
    makeMongod(req.body.filename, function(port) {
      var mongoURL = ip + ":" + port;
      request({
        url: server_url+"/request", 
        method: 'POST',
        json: true,
        body: {
          filename: req.body.filename,
          body: mongoURL
        }
      }, function(err, response) {
        if (err) {
    
        } else {
          getAllMembers(req.body.filename, function(list) {
            hostnames = list.map(x => x.name);
            replSet = new ReplSet(hostnames);
            replSet.on('open', () => {
              downloadFile();
            })
          });
        }
      });
    })
  })
});

router.post("/upload", function(req, res, next) {
  // Start a mongod
  getIp(function(ip) {
    makeMongod(function(port) {
      mongoClient.connect(replSetToPortMapping[replSetName],
        function(err, db) {
          const config = {
            '_id': req.body.filename,
            'members': [
              { '_id': 0, 'host': ip + ":" + port },
            ]
          }
          var adminDb = db.admin();
          adminDb.command({ replSetInitiate: config }, function(err, conf) {
            var bucket = new mongodb.GridFSBucket(db);

            fs.createReadStream(req.body.filepath).
              pipe(bucket.openUploadStream(req.body.filename)).
              on('error', function(error) {
                assert.ifError(error);
              }).
              on('finish', function() {
                console.log('done!');
                request({
                    url: server_url + "/request",
                    method: "POST",
                    json: true,
                    body: {
                      filename: req.body.filename,
                    }
                  },
                  function(err, response) {
                    if (err) {
                      system.log("error in upload");
                    } else {
                      system.log("it's inside");
                    }
                  });
              });
          });
        }
      )
    });
  });
  // Create a replica set
  // Add file to the replica set we created
  // Post to the the server upload route
  // Add to the wrangler map
  res.send("OK");
});

module.exports = router;
