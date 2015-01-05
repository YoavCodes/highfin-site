// called in global before_func, configures variables used in templates for displaying the current app docs
// based on page name currently being navigated to
exports.configureApp = function() {
	var path = fin._meta.last_nav().split('_')

	switch (path[0]) {
		case 'salmon':
			fin.meta.title = 'Salmon'
			fin.meta.description = 'A thick-client javascript framework backed by a razor-thin node.js server'			
			break;
		case 'guppy':
			fin.meta.title = 'Guppy'
			fin.meta.description = 'A command-line tool written in Go for running tasks.'
			break;
		case 'fishtank':
			fin.meta.title = 'Fishtank'
			fin.meta.description = 'Single-server continous deployment, designed to get you up and running fast.'
			break;
		case 'aquatic':
			fin.meta.title = 'Aquatic'
			fin.meta.description = 'Multi-server continuous deployment platform. Run your own PaaS.'
			break;	
		case 'blog':
			fin.meta.title = 'Blog'
			fin.meta.description = 'News and updates.'
			break;		
		default: 
			fin.meta.title = 'Swim with the Big fish'
			fin.meta.description = 'A collection of tools, frameworks, and services that make developing and deploying apps intuitive and fast.'
			break;
	}


	
}


// called in global after_func, highlights the current menu items for the page that was just navigated to
exports.selectMenu = function() {	
	var path = fin._meta.last_nav().split('_');
	// select top nav
	$('#topbar .menu li').removeClass('selected');	
	$('#topbar .menu li[name='+path[0]+']').addClass('selected');

	// select submenu
	if(path.length > 1) {		
		$('#submenu .menu li').removeClass('selected');	
		$('#submenu .menu li[name='+path[1]+']').addClass('selected');
	}
	// select sidebar
	if(path.length > 2) {		
		$('#sidebar .menu li').removeClass('selected');	
		$('#sidebar .menu li[name='+path[2]+']').addClass('selected');
	}
}

// from mustache
var entityMap = {
    //"&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;',
    "\t": "    "
  };
exports.escapeHtml = function(string) {
    return String(string).replace(/[<>"'\/\t]/g, function (s) {
      return entityMap[s];
    });
  }