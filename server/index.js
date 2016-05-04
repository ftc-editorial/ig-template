const express = require('express');
const engines = require('consolidate');

const app = express();

app.engine('mustache', engines.mustache);
app.set('view engine', 'mustache');
app.set('views', './views')

app.get('/', function(req, res) {
	res.render('main', {title: 'Test', body: 'hello world'});
});

app.listen(3010, function () {
  console.log('Example app listening on port 3010!');
});