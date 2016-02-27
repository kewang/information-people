var express = require('express');
var Git = require("nodegit");
var fs = require('fs');
var cheerio = require("cheerio");
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
var result;
var $;

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
    var content = String(blob);

    $ = cheerio.load(content);

    result = processing(req.body);

    fs.writeFileSync(FOLDER_NAME + "/" + FILE_NAME, $.html());

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
    console.log(result + " OK");

    return res.json({
      result: result
    });
  });
});

function processing(body){
  if(body.action !== "labeled"){
    return false;
  }

  var label_type = body.label.name;
  

  switch(label_type){
  case "開放討論中":
    return discussPeople(body);

    break;
  case "已新增":
    return addPeople(body);

    break;
  case "已刪除":
    return removePeople(body);

    break;
  case "已重複":
    return duplicatePeople(body);

    break;
  }
}

function discussPeople(body){
  // add people to pending list
  // add comment to content
  return "discussing";
}

function addPeople(body){
  // add people from pending list to content
  // add comment like "Added"
  // close issue
  return "added";
}

function removePeople(body){
  // remove people from content
  // add comment like "Removed"
  // close issue
  return "removed";
}

function duplicatePeople(body){
  // add comment like "Duplicated"
  // close issue
  return "duplicated";
}

module.exports = router;
