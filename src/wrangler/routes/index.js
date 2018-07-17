var express = require("express");
var portscanner = require("portscanner");
var router = express.Router();
var request = require('request');
var server_url = require('../settings').server_url;
var { makeMongod, getIp, downloadFile } = require('../src/Wrangler');
const mongoDriver = require('mongodb');
const MongoClient = mongoDriver.MongoClient;
const ReplSet = mongoDriver.ReplSet;

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

router.get('/download', function(req, res, next) {
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



module.exports = router;
