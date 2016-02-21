var express = require('express');
var router = express.Router();

router.post('/issues', function(req, res, next) {
  return res.end(req);
});

module.exports = router;
