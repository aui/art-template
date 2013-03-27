define(function (require, exports, module) {
    var helpers = require("../$helpers");
    var Render = function ($data) {
            'use strict';
            var $helpers = this,
                $out = '';
            $out += '<div id=\"header\"> <h1 id=\"logo\"><a href=\"http://www.qq.com\"><img width=\"134\" height=\"44\" src=\"http://mat1.gtimg.com/www/images/qq2012/qqlogo_1x.png\" alt=\"腾讯网\" /></a></h1> <ul id=\"nav\"> <li><a href=\"http://www.qq.com\">首页</a></li> <li><a href=\"http://news.qq.com/\">新闻</a></li> <li><a href=\"http://pp.qq.com/\">图片</a></li> <li><a href=\"http://mil.qq.com/\">军事</a></li> </ul> </div>';
            return new String($out)
        };
    Render.prototype = helpers;
    return function (data) {
        return new Render(data) + "";
    };
});