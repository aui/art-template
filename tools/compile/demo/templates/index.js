define(function (require) {
    var dependencies = {
        './include/header': require('./include/header'),
        './include/footer': require('./include/footer')
    };
    var helpers = require('./$helpers');
    var $render = function (id, data) {
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
                    if (content !== undefined) {
                        $out += content;
                        return content
                    }
                },
                $escapeHTML = $helpers.$escapeHTML,
                $getValue = $helpers.$getValue,
                title = $data.title,
                i = $data.i,
                list = $data.list,
                $out = '';
            $out += '';
            include('./include/header')
            $out += ' <div id="main"> <h3>';
            $out += $escapeHTML($getValue(title));
            $out += '</h3> <ul> ';
            for (i = 0; i < list.length; i++) {
                $out += ' <li><a href="';
                $out += $escapeHTML($getValue(list[i].url));
                $out += '">';
                $out += $escapeHTML($getValue(list[i].title));
                $out += '</a></li> ';
            }
            $out += ' </ul> </div> ';
            include('./include/footer')
            return new String($out)
        };
    Render.prototype = helpers;
    return function (data) {
        helpers.$render = $render;
        return new Render(data) + '';
    }
});