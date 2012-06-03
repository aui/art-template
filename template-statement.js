(function (exports) {

exports.openTag = '{';
exports.closeTag = '}';

exports.statement = function (code) {
    code = code.replace(/^\s/, '');
    
    var args = code.split(' ');
    var key = args.shift();
    var fuc = exports.keywords[key];
    
    if (fuc) {
        args = args.join(' ');
        return fuc.call(code, args);
    } else {
        throw {
            message: key
        };
    }
    
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
        
        var object = code[0];
        var as = code[1];
        var value = code[2];
        var name = code[3];
        var thisObject = code[4];
        
        var args = '';
        
        if (as !== 'as') {
            object = '[]';
        }
        
        if (value) {
            args += value;
        }
        
        if (name) {
            args += ',' + name;
        }
        
        if (thisObject) {
            args += ',' + thisObject;
        }
        
        return '$each(' + object + ',function(' + args + '){';
    },
    
    '/each': function () {  
        return '});';
    },
    
    'echo': function (code) {
        return '=' + code;
    },
    
    'include': function (code) {
        code = code.split(' ');
    
        var id = code[0];
        var data = code[1];

        return '=include(' + id + ',' + data + ')';
    }

};


exports.method('$each', function (data, callback) {
     
    if (_isArray(data)) {
        _forEach.call(data, callback);
    } else {
        for (var i in data) {
            callback.call(data, data[i], i, data);
        }
    }
    
});

var _forEach = exports.method('$forEach');
var _toString = Object.prototype.toString;
var _isArray = Array.isArray || function (obj) {
    return _toString.call(obj) === '[object Array]';
};


})(template);
