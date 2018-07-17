const mongoDriver = require("mongodb");
const mongoClient = mongoDriver.MongoClient;
const GridFSBucket = mongoDriver.GridFSBucket;
const server_url = require("../settings").server_url;
const { makeMongod, getIp, addNode, removeNodes, downloadFile } = require("../src/Wrangler");
const ReplSet = mongoDriver.ReplSet;  
var express = require("express");
var router = express.Router();
var request = require('request');
const fs = require('fs')

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/add_node", function(req, res, next) {
  addNode(req.body.filename, req.body.mongo);
  res.send("OK");
});

router.post("/remove_nodes", function(req, res, next) {
  removeNodes(req.body.filename);
  res.send("OK");
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
              res.send("OK");
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
    makeMongod(req.body.filename, function(port) {
      console.log(ip +":"+ port);
      mongoClient.connect("mongodb://" + ip + ":" + port, 
        function(err, client) {
          const db = client.db();
          console.log(err);
          const config = {
            '_id': req.body.filename,
            'members': [
              { '_id': 0, 'host': ip + ":" + port },
            ]
          }
          console.log(typeof db);

          console.log(typeof db.admin);
          var adminDb = db.admin();
          adminDb.command({ replSetInitiate: config }, function(err, conf) {
            console.log("err " + err);
            console.log("conf " + conf);
            var bucket = new GridFSBucket(db);

            fs.createReadStream(req.body.filepath).
              pipe(bucket.openUploadStream(req.body.filename)).
              on('error', function(error) {
                console.log(error)
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
