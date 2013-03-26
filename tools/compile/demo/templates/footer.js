define(function (require, exports, module) {
    var helpers = require("$helpers");
    var Render = function ($data) {
            'use strict';
            var $helpers = this,
                time = $data.time,
                $escapeHTML = $helpers.$escapeHTML,
                $getValue = $helpers.$getValue,
                $out = [];
            $out.push('<div id=\"footer\">');
            if (time) {
                $out.push(' <p>当前时间：');
                $out.push($escapeHTML($getValue(time)));
                $out.push('</p>');
            }
            $out.push('</div>');
            return new String($out.join(''))
        };
    Render.prototype = helpers;
    return function (data) {
        return new Render(data) + "";
    };
});