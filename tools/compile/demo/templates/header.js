define(function (require, exports, module) {
    var helpers = require("$helpers");
    var Render = function ($data) {
            'use strict';
            var $helpers = this,
                $out = [];
            $out.push('<div id=\"header\"> <h1 id=\"logo\">腾讯网</h1> <ul id=\"nav\"> <li><a href=\"#\">首页</a></li> <li><a href=\"#\">新闻</a></li> <li><a href=\"#\">图片</a></li> <li><a href=\"#\">军事</a></li> </ul></div>');
            return new String($out.join(''))
        };
    Render.prototype = helpers;
    return function (data) {
        return new Render(data) + "";
    };
});