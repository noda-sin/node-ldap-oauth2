oauth2orize = require "oauth2orize"
passport    = require "passport"
login       = require "connect-ensure-login"
hat         = require "hat"
db          = require "../lib/db"

server = oauth2orize.createServer()

server.serializeClient (client, done) ->
	done null, client._id

server.deserializeClient (id, done) ->
	db.Client.findById id, (err, client) ->
		if err
			done err
			return
		done null, client

server.grant oauth2orize.grant.code (client, redirectURI, user, ares, done) ->
	code = hat()
	db.AuthCode.save {
		code:     code,
		clientId: client.id,
		userId:   user.id,
		redirectURI: redirectURI
	}, (err) ->
		if err
			done err
			return
		done null, code

server.exchange oauth2orize.exchange.code (client, code, redirectURI, done) ->
	db.AuthCode.findByCode code, (err, authCode) ->
		if err
			done err
			return
		if !authCode or
			 client.id isnt authCode.clientID or
			 redirectURI isnt authCode.redirectURI
			done()
			return

		db.AuthCode.deleteByCode code, (err) ->
			if err
				done err
				return
			token = hat()
			db.AccessToken.save {
				token:    token,
				clientId: authCode.clientId
				userId:   authCode.userId
			}, (err) ->
				if err
					done err
					return
				done null, token

exports.authorization = [
  login.ensureLoggedIn(),
  server.authorization((clientId, redirectURI, done) ->
  	db.Client.findById clientId, (err, client) ->
  		if err
  			done err
  			return
			done null, client, redirectURI
  ),
  (req, res) ->
  	res.render "dialog", {
  		transactionID: req.oauth2.transactionID,
  		user:          req.user,
  		client:        req.oauth2.client
  	}
]

exports.decision = [
  login.ensureLoggedIn(),
  server.decision()
]

exports.token = [
  passport.authenticate(["basic", "oauth2-client-password"], { session: false }),
  server.token(),
  server.errorHandler()
]
