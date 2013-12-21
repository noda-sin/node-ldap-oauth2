mongoose = require "mongoose"
mongosse.connect('mongodb://localhost/ldap-oauth2');

ClientSchema = new mongoose.Schema {
	id:          String,
	secret:      String,
	name:        String,
	redirectURL: String,
	description: String,
}

AuthCodeSchema = new mongoose.Schema {
	code:        String,
	clientId:    String,
	userId:      String,
	redirectURL: String
}

AccessTokenSchema = new mongoose.Schema {
	token:       String,
	clientId:    String,
	userId:      String
}

exports.Client      = mongoose.model "Client",      ClientSchema
exports.AuthCode    = mongoose.model "AuthCode",    AuthCodeSchema
exports.AccessToken = mongoose.model "AccessToken", AccessTokenSchema