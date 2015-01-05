exports.loginValidator = function(form, inputs) {
	console.log('validate')
	return true
}

exports.loginSuccess = function(res) {
	console.log('res:',res)
	
}

exports.registerValidator = function(form, inputs) {
	console.log('validate')
	return true
}

exports.registerSuccess = function(res) {
	console.log('res:',res)
}

exports.activateValidator = function(form, inputs) {
	console.log('validate')
	return true
}

exports.activateSuccess = function(res) {
	console.log('res:',res)
}

exports.logout = function() {
	log('logout...')
	fin('fin.data.current_user').remove();
}


exports.editPostValidator = function(form, inputs) {
	form.find('[name="title"]').val(form.find('div.title').html());
	form.find('[name="content"]').html(form.find('div.content').html());
	return true
}

exports.editPostSuccess = function(res) {
	console.log('res:',res)
}

