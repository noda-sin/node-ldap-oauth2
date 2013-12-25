var mongoose = require("mongoose"),
    config   = require("config"),
    ClientSchema, Client,
    AuthCodeSchema, AuthCode,
    AccessTokenSchema, AccessToken;

mongoose.connect(config.MongoDB.uri);

ClientSchema = new mongoose.Schema({
  id: String,
  secret: String,
  name: String,
  redirectURL: String,
  description: String
});

AuthCodeSchema = new mongoose.Schema({
  code: String,
  clientId: String,
  userId: String,
  redirectURL: String
});

AuthCodeSchema.methods.findByCode = function(code, callback) {
  AuthCode.findOne({ code: code }, callback);
};

AuthCodeSchema.methods.removeByCode = function(code, callback) {
  AuthCode.findOneAndRemove({ code: code }, callback);
};

AccessTokenSchema = new mongoose.Schema({
  token: String,
  clientId: String,
  userId: String
});

AccessTokenSchema.methods.findByToken = function(token, callback) {
  AccessToken.findOne({ token: token }, callback);
};

exports.Client      = Client      = mongoose.model("Client", ClientSchema);
exports.AuthCode    = AuthCode    = mongoose.model("AuthCode", AuthCodeSchema);
exports.AccessToken = AccessToken = mongoose.model("AccessToken", AccessTokenSchema);
