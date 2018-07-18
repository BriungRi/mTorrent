const mongoDriver = require("mongodb");
const mongoClient = mongoDriver.MongoClient;
const GridFSBucket = mongoDriver.GridFSBucket;
const server_url = require("../settings").server_url;
const {
  makeMongod,
  getIp,
  addNode,
  removeNodes,
  downloadFile,
  uploadFile
} = require("../src/Wrangler");
const ReplSet = mongoDriver.ReplSet;
const Server = mongoDriver.Server;
var express = require("express");
var router = express.Router();
var request = require("request");
const fs = require("fs");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/add_node", function(req, res, next) {
  console.log("/add_node");
  addNode(req.body.filename, req.body.mongo);
  res.send("OK");
});

router.post("/remove_nodes", function(req, res, next) {
  removeNodes(req.body.filename);
  res.send("OK");
});

router.post("/download", function(req, res, next) {
  // send request to server to get added to replica set
  getIp(function(ip) {
    makeMongod(req.body.filename, function(port) {
      var mongoURL = ip + ":" + port;
      request(
        {
          url: server_url + "request",
          method: "POST",
          json: true,
          body: {
            filename: req.body.filename,
            body: mongoURL
          }
        },
        function(err, response) {
          if (err) {
            response.send(":(");
          } else {
            downloadFile();
            response.send("OK");
          }
        }
      );
    });
  });
});

router.post("/upload", function(req, res, next) {
  uploadFile(req.body.filename, req.body.filepath);
  res.send("OK");
});

module.exports = router;
