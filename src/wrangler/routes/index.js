var express = require("express");
var portscanner = require("portscanner");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/add_node", function(req, res, next) {
  console.log("adding node");
  console.log(req.body);
  console.log(req.body.hi);
  makeMongod("test3");
  res.send("ok");
});

router.post("/remove_nodes", function(req, res, next) {
  console.log("removing nodes");
  res.send("ok");
});

function makeMongod(filename) {
  const port = portscanner.findAPortNotInUse(3500, 4001, '127.0.0.1', function(error, port){});
  console.log(port);
  exec("./../bin/mongod --port " + port + " --replSet \"" + filename + "\" --bind_ip_all");
  return port;
};

module.exports = router;
