function getAllPosts(res) {
	tail.util.extend( res.response.data, tail.db('posts').results('sortByDate') )
	res.kill(200)
}

function getPublishedPosts(res) {	
	tail.util.extend( res.response.data, tail.db('posts').where('published').is(true).results() )
	res.kill(200)
}

function getSinglePost(res) {
	var rowid = res.segments[3];

	if(rowid === 'new') {
		res.kill()
		return
	}
	// todo: error when post doesn't exist in db.
	tail.util.extend(res.response.data, tail.db('posts').getResult(rowid));
	res.kill(200)
}

function savePost(res) {
	var title, content, categories, tags, published, rowid, author;

	title = res.fields.title;
	content = res.fields.content;
	categories = res.fields.categories || '';
	tags = res.fields.tags || '';
	published = (typeof res.fields.published !== 'undefined');
	rowid = res.fields.rowid || "";

	// todo: refactor so fin() exists on the server as well. :/
	// maybe have a model layer in tail that maps to fin's data model. dotkey mapping would be done on the server
	// when abstracting away the database.
	// for now though there's only one user in the response object when editpos is called.
	author_id = Object.keys(res.response.data.users)[0]

	if (rowid === "") {				
		// insert post into db and return the post from the database.
		var query = tail.db('posts').insert({
			title: title,
			content: content,
			author: '--users.'+author_id,
			categories: categories,
			tags: tags,
			published: published,
			date_created: new Date()
		});

		res.response.data.posts = res.response.data.posts || {};
		res.response.data.posts[query.last_insert_id] = query.inserted_child();
		res.redirect('/#!/blog/admin/overview')
		res.kill(200);
	} else {
		// update
		// var post = tail.db('posts').find(rowid).update({
		// 	title: title,
		// 	content: content,
		// 	author: '--users.'+author_id,
		// 	categories: categories,
		// 	tags: tags,
		// 	published: published
		// }).val;
		// no need to call save, will extend the db record and call save for you

		var post = tail.db('posts').find(rowid).val;
		post.title = title;
		post.content = content;
		post.author = '--users.'+author_id;
		post.categories = categories;
		post.tags = tags;
		post.published = published;		
		
		tail.db.save();


		res.response.data.posts = res.response.data.posts || {};
		res.response.data.posts[rowid] = post;
		res.redirect('/#!/blog/admin/overview')
		res.kill(200);
	} 
}

function deletePost(res) {
	var rowid = res.fields.rowid || "";

	tail.db('posts').find(rowid).remove();

	res.redirect('/#!/blog/admin/overview');

	res.kill(200);
}

module.exports = {
	getAllPosts: getAllPosts,
	getPublishedPosts: getPublishedPosts,
	getSinglePost: getSinglePost,
	savePost: savePost,
	deletePost: deletePost
}