# information-people

## Triggering builds through the API

* https://docs.travis-ci.com/user/triggering-builds

## Add people

                   trigger heroku
github open issue ---------------> transform payload and rewrite gh-pages html (git push to gh-pages)

## Using OAuth with Git

https://github.com/blog/1270-easier-builds-and-deployments-using-git-over-https-and-oauth

Next, you can simply use an OAuth token for the username and either a blank password or the string x-oauth-basic when cloning a repository.

```
git clone https://github.com/username/repo.git
Username: <token>
Password:
```

If you're cloning inside a script and need to avoid the prompts, you can add the token to the clone URL:

```
git clone https://<token>@github.com/owner/repo.git
```

or

```
git clone https://<token>:x-oauth-basic@github.com/owner/repo.git
```

## Buildpacks

* https://github.com/ddollar/heroku-buildpack-multi
* https://github.com/ddollar/heroku-buildpack-apt
