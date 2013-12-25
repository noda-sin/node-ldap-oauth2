var passport = require("passport"),
    login    = require("connect-ensure-login");

exports.indexPage = function(req, res) {
  res.send("OAuth 2.0 Server");
};

exports.signinPage = function(req, res) {
  res.render("signin");
};

exports.signin = passport.authenticate("local", {
  successReturnToOrRedirect: "/",
  failureRedirect: "/signin.html"
});

exports.signout = function(req, res) {
  req.logout();
  res.redirect("/");
};

exports.account = [
  login.ensureLoggedIn(),
  function(req, res) {
    res.render("account", {
      user: req.user
    });
  }
];