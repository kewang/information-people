var GITHUB_TOKEN = process.env.GITHUB_TOKEN;
var FILE_NAME = "index.htm";
var FOLDER_NAME = "./tmp";
var BRANCH_NAME = "gh-pages";
var REFS = "refs/heads/" + BRANCH_NAME;

var express = require('express');
var Git = require("nodegit");
var fs = require('fs');
var md = require("markdown").markdown;
var logger = require('tracer').colorConsole();
var cheerio = require("cheerio");
var sprintf = require("sprintf-js").sprintf;
var promisify = require("promisify-node");
var fse = promisify(require("fs-extra"));
var router = express.Router();
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

    return repo.getHeadCommit();
  }).then(function(headResult){
    head = headResult;

    return head.getEntry(FILE_NAME);
  }).then(function(entry){
    return entry.getBlob();
  }).then(function(blob){
    $ = cheerio.load(String(blob));

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

    if(!result.page){
      return res.json({
        result: "Add fail"
      });
    }

    return repo.createCommit("HEAD", author, author, sprintf("Add %s success", result.page.name), oid, [head]);
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

  // parse Markdown to JSON
  var tree = md.parse(body.issue.body);
  var ret = {};

  if(tree[2][0] !== "bulletlist"){
    ret.msg = "added fail";

    return ret;
  }

  var page = {};

  if(tree[2][1][0] === "listitem" && tree[2][2][0] === "listitem"){
    page.id = tree[2][1][1].split("Pages ID:")[1].trim();
    page.name = tree[2][2][1].split("Pages Name:")[1].trim();
  }

  var script = $("#pages-script").html().trim().replace("var pages = ", "").replace(";", "");

  script = eval(script);

  script.push(page);

  $("#pages-script").html("var pages = " + JSON.stringify(script) + ";");

  ret.msg = "added success";
  ret.page = page;

  return ret;
}

function removePeople(body){
  // remove people from content
  // add comment like "Removed"
  // close issue
  return "removed success";
}

function duplicatePeople(body){
  // add comment like "Duplicated"
  // close issue
  return "duplicated success";
}

module.exports = router;
