var express        = require('express'),
    http           = require('http'),
    path           = require('path'),
    domain         = require('domain'),
    passport       = require('passport'),
    LocalStrategy  = require('passport-local').Strategy,
    BasicStrategy  = require('passport-http').BasicStrategy,
    ClientStrategy = require('passport-oauth2-client-password').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    config         = require('config'),
    site           = require('./routes/site'),
    oauth2         = require('./routes/oauth2'),
    app            = express();

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express['static'](path.join(__dirname, 'public')));
});

var bindAndFind = function(dn, pass, id, callback) {
  var d      = domain.create(),
      userdn = id + ',' + config.LDAP.userbasedn,
      ldap   = new require('LDAP')({ uri: config.LDAP.uri });
  ldap.open(d.intercept(function() {
    ldap.bind({
      base: dn,
      password: pass
    }, d.intercept(function() {
      ldap.search({
        base: userdn,
        scope: 2
      }, d.intercept(function(user) {
        ldap.close();
        callback(null, user);
      }));
    }));
  }));
  d.on('error', function(err) {
    ldap.close();
    callback(err);
  });
};

passport.use(new LocalStrategy(function(userId, password, done) {
  bindAndFind(userId + ',' + config.LDAP.userbasedn, password, userId, done);
}));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  bindAndFind(config.LDAP.admindn, config.LDAP.adminpass, id, done);
});

var clientAuth = function(clientId, clientSecret, done) {
  return db.Client.findById(clientId, function(err, client) {
    if (err) {
      done(err);
      return;
    }
    if (!client || client.secret !== clientSecret) {
      done();
      return;
    }
    return done(null, client);
  });
};

passport.use(new BasicStrategy(clientAuth));
passport.use(new ClientStrategy(clientAuth));
passport.use(new BearerStrategy(function(accessToken, done) {
  return db.AccessToken.findByToken(accessToken, function(err, token) {
    if (err) {
      done(err);
      return;
    }
    if (!token) {
      done();
      return;
    }
    bindAndFind(config.LDAP.admindn, config.LDAP.adminpass, token.id, done);
  });
}));

app.get('/',            site.indexPage);
app.get('/signin.html', site.signinPage);
app.post('/signin',     site.signin);
app.get('/account',     site.account);

app.get('/dialog/authorize',           oauth2.authorization);
app.post('/dialog/authorize/decision', oauth2.decision);
app.post('/oauth2/token',              oauth2.token);

http.createServer(app).listen(3000);
