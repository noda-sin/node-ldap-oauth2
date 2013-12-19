username = "uid=admin,ou=system"
password = "secret"
ldap = new (require "LDAP")({
	uri:      "ldap://localhost:10389",
	version:  3,
	binddn:   username,
	password: password
});
ldap.open (err) ->
	if err
		console.error err
		return
	ldap.search {
		base: username,
		scope: 2
	}, (err, data) ->
		if err
			console.error err
			return
		console.log data
