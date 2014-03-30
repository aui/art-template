var template = require('../src/node-template-simple.js');
template.path = __dirname;// 设置模板目录，默认为引擎所在目录


var html = template.render('node-template/index', {
	title: '嵌入子模板',
	list: ['文艺', '博客', '摄影', '电影', '民谣', '旅行', '吉他']
});


console.log(html);
