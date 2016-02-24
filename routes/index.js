var express = require('express');
var Git = require("nodegit");
var fs = require('fs');
var router = express.Router();
var GITHUB_TOKEN = process.env.GITHUB_TOKEN;
var FILE_NAME = "index.htm";
var content;
var repo;
var head;
var oid;
var BRANCH_NAME = "gh-pages";
var REFS = "refs/heads/" + BRANCH_NAME;

router.post('/issues', function(req, res, next) {
  Git.Clone("https://" + GITHUB_TOKEN + ":x-oauth-basic@github.com/kewang/information-people", "./tmp", {
    checkoutBranch: BRANCH_NAME
  }).then(function(repoResult){
    repo = repoResult;

    console.log("getHeadCommit");

    return repo.getHeadCommit();
  }).then(function(headResult){
    head = headResult;
    console.log("getEntry");

    return head.getEntry(FILE_NAME);
  }).then(function(entry){
    console.log("getBlob");

    return entry.getBlob();
  }).then(function(blob){
    content = "DEF" + String(blob) + "ABC";

    fs.writeFileSync("./tmp/" + FILE_NAME, content);

    return repo.index();
  }).then(function(index){
    index.addByPath(FILE_NAME);
    index.write();

    return index.writeTree();
  }).then(function(oidResult){
    oid = oidResult;

    var author = Git.Signature.now("kewang", "cpckewang@gmail.com");

    return repo.createCommit("HEAD", author, author, "Add test", oid, [head]);
  }).then(function(commitId){
    console.log("New Commit: " + commitId);

    return repo.getRemote("origin");
  }).then(function(remote){
    return remote.push([REFS + ":" + REFS]);
  }).done(function(){
    console.log("Push OK");

    return res.json(content);
  });
});

module.exports = router;
