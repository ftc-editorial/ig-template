const fs = require('fs');
const nunjucks = require('nunjucks');

const indexData = {
	items: {
		"myanmar": "缅甸失地农民",
		"china-gdp":"如何读懂中国GDP？"	
	}
}
const key = 'myanmar';
const value = 'world';
if (!(key in indexData.items)) {
	indexData.items[key] = value;
}

console.log(indexData)
// nunjucks.render('demos/index.njk', value, (err, res) => {
// 	console.log(res);
// });