define(function (require) {
    var helpers = require('./../$helpers');
    var Render = function ($data) {
        'use strict';
        var $helpers = this,
            time = $data.time,
            $escapeHTML = $helpers.$escapeHTML,
            $getValue = $helpers.$getValue,
            $out = '';
        $out += '<div id="footer"> ';
        if (time) {
            $out += ' <p class=\'time\'>';
            $out += $escapeHTML($getValue(time));
            $out += '</p> ';
        }
        $out += ' </div>';
        return new String($out)
    };
    Render.prototype = helpers;
    return function (data) {
        return new Render(data) + '';
    };
});