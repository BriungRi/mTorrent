const express = require("express");
const router = express.Router();
const request = require("request");
const mongoDriver = require("mongodb");
const mongoClient = mongoDriver.MongoClient;
const server_url = "http://localhost" || require("../settings").server_url;
const { makeMongod, getIp, addNode, removeNodes } = require("../src/Wrangler");

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

router.get("/download", function(req, res, next) {
  // send request to server to get added to replica set
  getIp(function(ip) {
    makeMongod(function(port) {
      var mongoURL = ip + ":" + port;
      request(
        {
          url: server_url + "/request",
          method: "POST",
          json: true,
          body: {
            filename: req.body.filename,
            body: mongoURL
          }
        },
        function(err, response) {
          if (err) {
          } else {
            //check until download is finished
          }
        }
      );
    });
  });
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
