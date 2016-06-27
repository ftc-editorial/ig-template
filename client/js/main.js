const oShare = require('ftc-share');
const oToggle = require('./toggle');
const oSticky = require('./sticky');
oShare.init();
oToggle.init();
const stickyInstances = oSticky.init();
console.log(stickyInstances);





