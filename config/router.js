// routes
exports.router = function(res, req, pathname, segments, command) {

	var http = require("http")	
	
    console.log('p:'+pathname, 's:'+segments, 'c:'+command)

    if(!segments) {
    	res.kill()
    	return
    }

	switch(segments[0]) {
		
		case "blog":        			
			switch(segments[1]) {
				
				case "admin":		
					if(typeof tail.db('config').find('mailgun_api_key').val !== 'string') {
						// configuration is missing
						if(segments[2] === 'forms' && command === 'install') {
							// submit handler for configuration/install form
							tail.app.install(res);
						} else if (segments[2] === 'configure') {
							// on the configure page
							res.kill(200)
						} else {
							// site is not configured, redirect to the configuration page
							res.redirect('/#!/blog/admin/configure')
							res.kill(307)
						}
						return
					}			
					// user should be authenticated to proceed     					
					tail.app.auth.isAuthed(res, req)
						.hasSession(function() {
							//console.log('has session')
							// user had, or now has a valid session ie: is authenticated
							// user can load page
							switch(segments[2]) {
								case "login":
								case "register":	
								case "activate":	
									// todo: redirect to overview
									res.redirect('/#!/blog/admin/overview');
									res.kill(200);
									break;
								case "logout":
									tail.app.auth.logout(res)
									break;
								case "overview":
									// todo: load overview data from sql
									tail.app.blog.getAllPosts(res);
									break;								
								case "post":
								case "editpost":
									if(command === 'delete') {
										tail.app.blog.deletePost(res);
									} else {
										// todo: load post data from sql
										tail.app.blog.getSinglePost(res);
									}
									break;
								case 'forms':
									switch(command) {
										case 'editpost':
											tail.app.blog.savePost(res);
											break;
										default:
											// submitted login form when already logged in
											res.redirect('/#!/blog/admin/overview')
											res.kill()
											return;
									}
									break;
								default:
									// admin page
									res.redirect('/#!/blog/admin/overview')
									res.kill();
									return;
							}
						})
						.noSession(function() {
							// user does not have a valid session ie: is not authenticated
							//console.log('no session')
							// user should be redirected to login screen
							switch(segments[2]) {
								case "login":
								case "register":								
								case "":
									// do nothing
									res.kill();
									break;
								case "activate":
									// will try activate if email link
									tail.app.auth.activateUser(res, req, segments);									
									break;
								// form handlers
								case 'forms':
									switch(command) {
										case 'login':
											tail.app.auth.createSession(res, req);
											return
										case 'register':
											tail.app.auth.createUser(res, req);
											return
										case 'activate':
											tail.app.auth.activateUser(res, req);
											return
										default:
											res.kill()
											return
									}							
									break;
								default:
									// todo: redirect user to login screen									
									res.redirect('/#!/blog/admin/login');
									res.kill(401); // not authenticated       									        									
									break;
							}        							
						}).check();

					break;
        		case "post":

        			return
        		default: 
        			tail.app.blog.getPublishedPosts(res);
        			return
			}
			break;
		default: 
			res.kill();
	}	        


	 // todo: consider functional route/handler declaration style with middleware, or at least make routes easier to read/follow

 
    /*
	tail.route( 'blog/admin/forms', 'login', function(){
		createSession(res, req);
	} )

    */
    
}