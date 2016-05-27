const express = require('express');
const engines = require('consolidate');
const nunjucks = require('nunjucks');
var debug = require('debug')('app');
// const Datastore = require('nedb');

const app = express();
debug('booting Interactive Graphics CMS');

// const filename = 'db/' + process.argv[2];

// const collection = new Datastore({
// 	filename: filename,
// 	autoload: true
// });

// const doc = {
// 	hello: 'world',
// 	n: 5,
// 	today: new Date(),
// 	nedbIsAwesome: true,
// 	notthere: null,
// 	notToBeSaved: undefined,
// 	fruits: ['apple', 'orange', 'pear'],
// 	infos: {
// 		name: 'nedb'
// 	}
// };

// collection.insert(doc, function(err, newDoc) {
// 	if (err) {
// 		console.log(err);
// 	}
// 	console.log(doc);
// });


nunjucks.configure('views', {
	autoescape: true,
	express: app,
	watch:true,
	noCache: true
});


app.get('/', function(req, res) {
	debug(req.method + ' ' + req.url)
	res.render('index.njk', {title: 'Test'});
});

app.listen(3010, function () {	
  console.log('Example app listening on port 3010!');
});