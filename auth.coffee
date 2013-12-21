passport               = require "passport"
LocalStrategy          = require "passport-local" .Strategy
BasicStrategy          = require "passport-http" .BasicStrategy
ClientPasswordStrategy = require "passport-oauth2-client-password" .Strategy
BearerStrategy         = require "passport-http-bearer" .Strategy
LDAP                   = require "LDAP"

passport.use new LocalStrategy( (userId, password, done) ->
  userdn = "#{userId},#{process.env.LDAP_USER_BASEDN}"
  ldap = new LDAP {
    uri:      process.env.LDAP_URI,
    binddn:   userdn,
    password: password
  }
  ldap.open (err) ->
    if err
      done err
      return
    ldap.search {
      base: userdn,
      scope: 2
    }, (err, user) ->
      if err
        done err
        return
      done null, user
)

passport.serializeUser (user, done) ->
  done null, user.id

passport.deserializeUser (id, done) ->
  # do something

clientAuth = (clientId, clientSecret, done) ->
  db.Client.findById clientId, (err, client) ->
    if err
      done err
      return
    if !client or client.secret isnt clientSecret
      done()
      return
    done null, client

passport.use new BasicStrategy(clientAuth)
passport.use new ClientPasswordStrategy(clientAuth)
passport.use new BearerStrategy( (accessToken, done) ->
  db.AccessToken.findByToken accessToken, (err, token) ->
    if err
      done err
      return
    if !token
      done()
      return
    # do something
