define(function (require, exports, module) {
    var dependencies = {
        "header": require("header"),
        "footer": require("footer")
    };
    var helpers = require("$helpers");
    helpers.$render = function (id, data) {
        return dependencies[id](data);
    };
    var Render = function ($data) {
            'use strict';
            var $helpers = this,
                include = function (id, data) {
                    if (data === undefined) {
                        data = $data
                    }
                    var content = $helpers.$render(id, data);
                    $out.push(content);
                },
                $escapeHTML = $helpers.$escapeHTML,
                $getValue = $helpers.$getValue,
                title = $data.title,
                i = $data.i,
                list = $data.list,
                $out = [];
            $out.push('');
            include('header')
            $out.push('<div id=\"main\"> <h3>');
            $out.push($escapeHTML($getValue(title)));
            $out.push('</h3> <ul> ');
            for (var i = 0; i < list.length; i++) {
                $out.push(' <li><a href=\"');
                $out.push($escapeHTML($getValue(list[i].url)));
                $out.push('\">');
                $out.push($escapeHTML($getValue(list[i].title)));
                $out.push('</a></li> ');
            }
            $out.push(' </ul></div>');
            include('footer')
            return new String($out.join(''))
        };
    Render.prototype = helpers;
    return function (data) {
        return new Render(data) + "";
    };
});