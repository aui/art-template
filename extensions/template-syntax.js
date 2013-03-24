/*!
 * artTemplate - Syntax Extensions
 * https://github.com/aui/artTemplate
 * Released under the MIT, BSD, and GPL Licenses
 * Email: 1987.tangbin@gmail.com
 */
 
(function (exports) {


var _helpers = exports.prototype;
var _toString = Object.prototype.toString;
var _isArray = Array.isArray || function (obj) {
    return _toString.call(obj) === '[object Array]';
};


exports.openTag = '{';
exports.closeTag = '}';

exports.parser = function (code) {
    code = code.replace(/^\s/, '');
    
    var args = code.split(' ');
    var key = args.shift();
    var keywords = exports.keywords;
    var fuc = keywords[key];
    
    if (fuc && keywords.hasOwnProperty(key)) {
    
        args = args.join(' ');
        code = fuc.call(code, args);
        
    } else if (_helpers.hasOwnProperty(key)) {
        
        args = args.join(',');
        code = '==' + key + '(' + args + ');';
        
    } else {

        code = code.replace(/[\s;]*$/, '');
        code = '=' + code;
    }
    
    return code;
};


exports.keywords = {
    
    'if': function (code) {
        return 'if(' + code + '){';
    },
    
    'else': function (code) {
        code = code.split(' ');
        
        if (code.shift() === 'if') {
            code = ' if(' + code.join(' ') + ')';
        } else {
            code = '';
        }

        return '}else' + code + '{';
    },
    
    '/if': function () {
        return '}';
    },
    
    'each': function (code) {
        
        code = code.split(' ');
        
        var object = code[0] || '$data';
        var as     = code[1] || 'as';
        var value  = code[2] || '$value';
        var index  = code[3] || '$index';
        
        var args   = value + ',' + index;
        
        if (as !== 'as') {
            object = '[]';
        }
        
        return '$each(' + object + ',function(' + args + '){';
    },
    
    '/each': function () {
        return '});';
    },
    
    'echo': function (code) {
        return 'print(' + code + ');';
    },
    
    'include': function (code) {
        code = code.split(' ');
    
        var id = code[0];
        var data = code[1];
        var args = id + (data ? (',' + data) : '');

        return 'include(' + args + ');';
    }

};


exports.helper('$each', function (data, callback) {
     
    if (_isArray(data)) {
        for (var i = 0, len = data.length; i < len; i++) {
            callback.call(data, data[i], i, data);
        }
    } else {
        for (var i in data) {
            callback.call(data, data[i], i);
        }
    }
    
});



})(template);
