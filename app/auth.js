var crypto = require('crypto');

// login
function createSession(res, req) {
	var email = res.fields.email;
	var password = res.fields.password;	
	if (email.length > 0 && password.length > 0) {

		var pass_hash = crypto.createHash('sha256').update(password).digest('base64');

		// todo: limit
		var query = tail.db('users').where('email').is(email).and('pass_hash').is(pass_hash).sort();
		var user = query[0];		
		if( query.length > 0 ) {
			if (user.activation_code !== '') {
				res.response.meta.errors.push('You need to activate your email.');
				res.redirect('/#!/blog/admin/activate');
				res.kill(401) // not authed
				return
			}

			// email and password match, create a session
			var session_id = (Math.random()*Math.pow(10,250)).toString(36).substr(2);
			
			// update the database
			user.ip_address = req.connection.remoteAddress
			user.session_id = session_id
			tail.db.save();

			query = tail.db('users').find(user.rowid);			

			// login successful, session created, front-end should redirect
			// to admin overview page
			res.setHeader( "Set-Cookie", [ "session_id="+session_id, 'expires='+new Date(new Date().getTime()+86409000).toUTCString() ] );
			res.redirect('/#!/blog/admin/overview')
			res.kill(200); 
		} else {
			res.response.meta.errors.push('username and/or password incorrect')
			res.kill(200); 
		}
	} else {
		res.response.meta.errors.push('required a username and password');
		res.kill(400) // Bad Request
	}
}

// register
function createUser(res, req) {
	var email = res.fields.email;
	var password = res.fields.password;
	var verify_password = res.fields.verify_password;

	var display_name = res.fields.display_name;

	// validation
	if(password !== verify_password) {
		res.response.meta.errors.push("password did not match verify password");
		res.kill(400); // Bad Request
		return
	}

	if(email.length == 0  && password.length === 0 && display_name.length === 0) {
		res.response.meta.errors.push('required a username and password');
		res.kill(400) // Bad Request
		return;
	}

	var pass_hash = crypto.createHash('sha256').update(password).digest('base64');
	var activation_code = (Math.random()*Math.pow(10,250)).toString(36).substr(2);

	var user_exists = (tail.db('users').where('email').is(email).sort().length > 0);

	if(!user_exists) {
		var new_user = {
			email: email,
			pass_hash: pass_hash,
			display_name: display_name,
			activation_code: activation_code,
			session_id: '',
			ip_address: ''
		}
		tail.db('users').insert(new_user);

		// email user with activation code				
		var subject = "Activate Your Account";
		var text = "Hi "+display_name+",\n\n" +
				 	"You recently registered at highf.in.\n\n"+
				 	"To Activate your account visit: http://highf.in/#!/blog/admin/activate/"+encodeURIComponent(email)+"/"+activation_code+"\n\n"+
				 	"Activation code: "+activation_code;
		
		tail.app.mail.send(email, subject, text, function() {					
			res.redirect('/#!/blog/admin/activate');
			res.kill(200);
		});
	} else {
		res.response.meta.errors.push("user with this email address already exists");
		res.kill(400); // bad request
	}
}

function activateUser(res, req, segments) {
	var email, activation_code;

	if(segments && segments.length === 5) {
		email = segments[3];
		activation_code = segments[4];
	} else if(res.fields.email && res.fields.activation_code) {
		email = res.fields.email;
		activation_code = res.fields.activation_code;
	} else {
		// user is just loading the activate page.		
		res.kill(200)
		return
	}

	var query = tail.db('users').where('email').is(email).and('activation_code').is(activation_code).sort();

	if(query.length > 0) {		
		query[0].activation_code = '';
		tail.db.save();

		res.redirect("/#!/blog/admin/login");
		res.kill(200)
	}
}

function logout(res) {
	if(typeof res.req.headers.cookie !== 'undefined') {
		var session_id = res.req.headers.cookie.match(/session_id=([^;]+)/);
		if(session_id) {
			
			var user = tail.db('users').where('ip_address').is(res.req.connection.remoteAddress)
							.and('session_id').is(session_id).sort([0]);
			user.session_id = ''
			tail.db.save();

			delete res.response.data.current_user;
			res.setHeader( "Set-Cookie", [ "session_id=none" ] );
			res.redirect('/#!/blog/admin/login')				
			res.kill(200)
		} else {
			res.redirect('/#!/blog/admin/login')
			res.kill(400)
		}
	}
}

// check if user is authenticated.
// todo: add username
function isAuthed(res, req) {	
	var authed = {
		hasSession: function(fn) { if(fn) { this._hasSession = fn; return this } else { if (this._hasSession) { this._hasSession() } } },
		_hasSession: null,
		noSession: function(fn) { if(fn) { this._noSession = fn; return this } else { if (this._noSession) { this._noSession() } } },
		_noSession: null,
		check: check
	}

	function check(fn) {
		if ( typeof fn === 'function' ) {
			// override check with a custom function
			fn(authed);
			return
		}

		if(typeof req.headers.cookie === 'undefined') {
			// no cookie, no session			
			authed.noSession();
		} else {
			// has cookie, no session
			var session_id = req.headers.cookie.match(/session_id=([^;]+)/);
			if(!session_id) {
				// has cookie, no session_id in cookie
				authed.noSession();
			} else {
				// has cookie, has session_id, check if session is valid
				session_id = session_id[1] // set it to the match group

				var query = tail.db('users').where('ip_address').is(req.connection.remoteAddress)
											.and('session_id').is(session_id);
				var sorted = query.sort();
				

				if(sorted.length > 0) {
					// session_id was valid, user is still authed, extend cookie expiration time
					res.setHeader( "Set-Cookie", [ "session_id="+session_id, 'expires='+new Date(new Date().getTime()+86409000).toUTCString() ] );

					res.response.data = query.results();
					
					// todo: front-end should be responsible for front-end specific meta data modelling
					tail.util.extend(res.response.data, {
						'current_user': '__fin.data.users.'+sorted[0].rowid
					});

					// if hasSession was set, then call it
					authed.hasSession();

				} else {
					authed.noSession();
				}
			}
		}		
	}

	return authed;
}

module.exports = {
	createSession: createSession,
	createUser: createUser,
	activateUser: activateUser,
	isAuthed: isAuthed,
	logout: logout
}