var express = require("express");
var router = express.Router();
var request = require('request');
var server_url = require('../settings').server_url;
var { addNode, removeNodes, makeMongod, getIp, downloadFile } = require('../src/Wrangler');
const mongoDriver = require('mongodb');
const ReplSet = mongoDriver.ReplSet;

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



module.exports = router;
