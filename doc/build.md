#	编译源码
============

首先使用 npm 安装 UglifyJS2

	npm install uglify-js -g

然后切换到 artTemplate 目录，输入：
	
	uglifyjs ./src/template.js -o ./dist/template.js -p 5 -c -m
	uglifyjs ./src/template.js ./src/template-syntax.js -o ./dist/template-simple.js -p 5 -c -m