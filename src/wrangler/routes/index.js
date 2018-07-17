var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/add_node', function(req, res, next) {

});

router.post('/remove_nodes', function(req, res, next) {

});

module.exports = router;
