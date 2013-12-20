mongoose = require "mongoose"
mongosse.connect('mongodb://localhost/ldap-oauth2');

ClientSchema = new mongoose.Schema {
	name: String,
	secret: String,
	callbackUrl: String
}

exports.Client = mongoose.model "Client", ClientSchema