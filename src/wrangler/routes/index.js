const express = require("express");
const mongoDriver = require("mongodb");
const mongoClient = mongoDriver.MongoClient;
const replSet = mongoDriver.replSet;

const router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/add_node", function(req, res, next) {
  addNode(req.body.filename, req.body.mongo);
});

router.post("/remove_nodes", function(req, res, next) {
  console.log("removing nodes");
  res.send("ok");
});

function addNode(replSetName, mongoURL) {
  const dbName = "admin";
  const collectionName = "file";

  MongoClient.connect(
    replSetName,
    function(err, db) {
      var adminDb = db.admin();
      adminDb.command({ replSetGetConfig: 1 }, function(err, conf) {
        conf.members.push(mongoURL);
        adminDb.command({ replSetGetConfig: conf }, function(err, info) {
          console.log(info);
        });
      });
    }
  );
}

module.exports = router;
