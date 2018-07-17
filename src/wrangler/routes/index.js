var express = require("express");
var router = express.Router();

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

module.exports = router;
