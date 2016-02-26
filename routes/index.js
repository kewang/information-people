var express = require('express');
var Git = require("nodegit");
var fs = require('fs');
var promisify = require("promisify-node");
var fse = promisify(require("fs-extra"));
var router = express.Router();
var GITHUB_TOKEN = process.env.GITHUB_TOKEN;
var FILE_NAME = "index.htm";
var FOLDER_NAME = "./tmp";
var BRANCH_NAME = "gh-pages";
var REFS = "refs/heads/" + BRANCH_NAME;
var repo;
var head;
var oid;
var content;

router.post('/issues', function(req, res, next) {
  fse.remove(FOLDER_NAME).then(function(){
    return Git.Clone("https://" + GITHUB_TOKEN + ":x-oauth-basic@github.com/kewang/information-people", FOLDER_NAME, {
      checkoutBranch: BRANCH_NAME
    });
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
    content = String(blob);

    processing(req.body);

    fs.writeFileSync(FOLDER_NAME + "/" + FILE_NAME, content);

    return repo.index();
  }).then(function(index){
    index.addByPath(FILE_NAME);
    index.write();

    return index.writeTree();
  }).then(function(oidResult){
    oid = oidResult;

    var author = Git.Signature.now("information-people", "cpckewang@gmail.com");

    return repo.createCommit("HEAD", author, author, "Add test", oid, [head]);
  }).then(function(commitId){
    console.log("New Commit: " + commitId);

    return repo.getRemote("origin");
  }).then(function(remote){
    return remote.push([REFS + ":" + REFS]);
  }).catch(function(err){
    console.error(err);
  }).done(function(){
    console.log("Push OK");

    return res.json({
      result: "OK"
    });
  });
});

function processing(body){
  if(body.action !== "labeled"){
    return;
  }

  var label_type = body.label.name;

  switch(label_type){
  case "已新增":
    addPeople(body);

    break;
  case "已刪除":
    removePeople(body);

    break;
  case "已重複":
    duplicatePeople(body);

    break;
  }
}

module.exports = router;
