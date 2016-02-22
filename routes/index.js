var express = require('express');
var Git = require("nodegit");
var router = express.Router();

router.post('/issues', function(req, res, next) {
  Git.Clone("https://github.com/kewang/information-people", "./tmp").then(function(repo){
    console.log("getHeadCommit");

    return repo.getHeadCommit();
  }).then(function(commit){
    console.log("getEntry");

    return commit.getEntry("README.md");
  }).then(function(entry){
    console.log("getBlob");

    return entry.getBlob();
  }).then(function(blob){
    var str = String(blob);

    console.log(str);

    return res.json(str);
  });
});

module.exports = router;
