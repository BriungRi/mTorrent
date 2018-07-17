var express = require("express");
var router = express.Router();
var request = require('request');
var server_url = require('../settings').server_url;

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/add_node", function(req, res, next) {
  console.log("adding node");
  console.log(req.body);
  console.log(req.body.hi);
  res.send("ok");
});

router.post("/remove_nodes", function(req, res, next) {
  console.log("removing nodes");
  res.send("ok");
});

router.get('/download', function(req, res, next) {
  // send request to server to get added to replica set
  var mongoURL = "10.4.102.153:15000"

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
      
    }
  })
});

module.exports = router;
