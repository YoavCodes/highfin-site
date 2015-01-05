function install(res) {
	var mailgun_api_key = res.fields.mailgun_api_key;
	if(typeof mailgun_api_key === "undefined") {
		res.error(400, 'missing params');
		return
	}

	tail.db('config').find('mailgun_api_key').set(mailgun_api_key);

	tail.config.mailgun_api_key = mailgun_api_key

	res.redirect("/#!/blog/admin/login");
	res.kill(200)
}

module.exports = install