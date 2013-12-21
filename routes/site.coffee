passport = require "passport"
login    = require "connect-ensure-login"

exports.indexPage = (req, res) ->
	res.send "OAuth 2.0 Server"

exports.loginPage = (req, res) ->
	res.render "login"

exports.login  = passport.authenticate "local", { successReturnToOrRedirect: "/", failureRedirect: "/login.html" }

exports.logout = (req, res) ->
	req.logout();
	res.redirect "/"

exports.account = [
	login.ensureLoggedIn(),
	(req, res) ->
		res.render "account", { user: req.user }
]
