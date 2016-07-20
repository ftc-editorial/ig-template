const path = require('path')
const express = require('express');
const nunjucks = require('nunjucks');
const logger = require('morgan');

const app = express();

nunjucks.configure('admin/views', {
	autoescape: true,
	express: app,
	watch:true,
	noCache: true
});

app.use(express.static(path.resolve(__dirname, 'public')));

app.use(logger('dev'));

app.get('/', function(req, res) {
	res.render('index.njk');
});

app.post('/meta', function(req, res, next) {
	console.log(req.body);
	res.send('Posted to meta');
});

app.listen(3010, function () {	
  console.log('Admin app listening on port 3010!');
});