var Mailgun = require('../libs/node_modules/mailgun').Mailgun;
var mg;

// simple mailgun wrapper
//@callback: function(err) { if(!err){ console.log('success') } }
function send(to, subject, text, callback) {
	var mailgun_api_key = tail.db('config').find('mailgun_api_key').val;
	
	if (typeof mailgun_api_key === 'undefined') return
		
	if( typeof mg === 'undefined' ) {
		mg = new Mailgun(mailgun_api_key);
	}

	text += "\n\n"+
			"--The Highf.in team\n\n\n"
			"If you received this email in error send an email to mail@highf.in with the subject 'remove'"
	mg.sendText('HighF.in <mail@mg.highf.in>', to, subject, text, 'mail.highf.in', callback);
}

module.exports = {
	send: send
}
