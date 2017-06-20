const marked = require('marked');
const renderer = new marked.Renderer();

renderer.paragraph = function(text) {
  return text;
}

const md = '按照许多社会经济指标衡量，非裔美国人群体依然像是一个发展中国家的国民：根据[皮尤研究中心(Pew Research Center)的数据](http://www.pewresearch.org/fact-tank/2015/07/14/black-child-poverty-rate-holds-steady-even-as-other-groups-see-declines/)，近40%非裔美国孩子生活在贫困线以下，白人孩子的这一比例约为11%。比起同龄的白人女孩，像阿尔马尼这样的黑人女孩更有可能被[停学、开除，或者最终落入青少年司法系统。](https://static1.squarespace.com/static/53f20d90e4b0b80451158d8c/t/54d2d37ce4b024b41443b0ba/1423102844010/BlackGirlsMatterReport.pdf)';
console.log(marked(md, {renderer}));