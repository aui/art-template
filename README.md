# art-template

[![NPM Version](https://img.shields.io/npm/v/art-template.svg)](https://npmjs.org/package/art-template)
[![NPM Downloads](http://img.shields.io/npm/dm/art-template.svg)](https://npmjs.org/package/art-template)
[![Node.js Version](https://img.shields.io/node/v/art-template.svg)](http://nodejs.org/download/)
[![Travis-ci](https://travis-ci.org/aui/art-template.svg?branch=master)](https://travis-ci.org/aui/art-template)
[![Coverage Status](https://coveralls.io/repos/github/aui/art-template/badge.svg?branch=master)](https://coveralls.io/github/aui/art-template?branch=master)

[English document](https://aui.github.io/art-template/) | [中文文档](https://aui.github.io/art-template/zh-cn/index.html)

art-template is a simple and superfast templating engine that optimizes template rendering speed by scope pre-declared technique, hence achieving runtime performance which is close to the limits of JavaScript. At the same time, it supports both NodeJS and browser. [speed test online](https://aui.github.io/art-template/rendering-test/).

art-template 是一个简约、超快的模板引擎。它采用作用域预声明的技术来优化模板渲染速度，从而获得接近 JavaScript 极限的运行性能，并且同时支持 NodeJS 和浏览器。[在线速度测试](https://aui.github.io/art-template/rendering-test/)。

[![chart](https://aui.github.io/art-template/images/chart@2x.png)](https://aui.github.io/art-template/rendering-test/)

## Feature

1. performance is close to the JavaScript rendering limits
2. debugging friendly. Syntax errors or runtime errors will be positioned accurately at which line of template. Support setting breakpoint in templating files (Webpack Loader)
3. support Express, Koa, Webpack
4. support template inheritance and sub template
5. browser version is only 6KB

## 特性

1. 拥有接近 JavaScript 渲染极限的的性能
2. 调试友好：语法、运行时错误日志精确到模板所在行；支持在模板文件上打断点（Webpack Loader）
5. 支持 Express、Koa、Webpack
6. 支持模板继承与子模板
7. 浏览器版本仅 6KB 大小
