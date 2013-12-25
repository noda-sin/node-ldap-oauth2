var oauth2orize = require("oauth2orize"),
    passport    = require("passport"),
    login       = require("connect-ensure-login"),
    hat         = require("hat"),
    db          = require("../lib/db");

var server = oauth2orize.createServer();

server.serializeClient(function(client, done) {
  done(null, client._id);
});

server.deserializeClient(function(id, done) {
  db.Client.findById(id, function(err, client) {
    if (err) {
      done(err);
      return;
    }
    done(null, client);
  });
});

server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
  var code = hat();
  db.AuthCode.save({
    code: code,
    clientId: client.id,
    userId: user.id,
    redirectURI: redirectURI
  }, function(err) {
    if (err) {
      done(err);
      return;
    }
    done(null, code);
  });
}));

server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  db.AuthCode.findByCode(code, function(err, authCode) {
    if (err) {
      done(err);
      return;
    }
    if (!authCode || client.id !== authCode.clientID || redirectURI !== authCode.redirectURI) {
      done();
      return;
    }
    db.AuthCode.deleteByCode(code, function(err) {
      if (err) {
        done(err);
        return;
      }

      var token = hat();
      db.AccessToken.save({
        token: token,
        clientId: authCode.clientId,
        userId: authCode.userId
      }, function(err) {
        if (err) {
          done(err);
          return;
        }
        done(null, token);
      });
    });
  });
}));

exports.authorization = [
  login.ensureLoggedIn(),
  server.authorization(function(clientId, redirectURI, done) {
    db.Client.findById(clientId, function(err, client) {
      if (err) {
        done(err);
      }
    });
    done(null, client, redirectURI);
  }),
  function(req, res) {
    res.render("dialog", {
      transactionID: req.oauth2.transactionID,
      user: req.user,
      client: req.oauth2.client
    });
  }
];

exports.decision = [login.ensureLoggedIn(), server.decision()];

exports.token = [
  passport.authenticate(["basic", "oauth2-client-password"], {
    session: false
  }),
  server.token(),
  server.errorHandler()
];
