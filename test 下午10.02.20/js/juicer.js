/*
    ********** Juicer **********
    ${A Fast template engine}
    Project Home: http://juicer.name

    Author: Guokai
    Gtalk: badkaikai@gmail.com
    Blog: http://benben.cc
    Licence: MIT License
    Version: 0.4.0-dev
*/

(function() {
    var juicer = function() {
        var args = [].slice.call(arguments);
        args.push(juicer.options);
        
        if(arguments.length == 1) {
            return juicer.compile.apply(juicer, args);
        }
        
        if(arguments.length >= 2) {
            return juicer.to_html.apply(juicer, args);
        }
    };

    var __escapehtml = {
        escapehash: {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2f;'
        },
        escapereplace: function(k) {
            return __escapehtml.escapehash[k];
        },
        escaping: function(str) {
            return typeof(str) !== 'string' ? str : str.replace(/[&<>"]/igm, this.escapereplace);
        },
        detection: function(data) {
            return typeof(data) === 'undefined' ? '' : data;
        }
    };
    
    var __throw = function(error) {
        if(console) {
            if(console.warn) {
                console.warn(error);
                return;
            }

            if(console.log) {
                console.log(error);
                return;
            }
        }
        
        throw(error);
    };

    var __creator = function(o, proto) {
        o = o !== Object(o) ? {} : o;

        if(o.__proto__) {
            o.__proto__ = proto;
            return o;
        }

        var _Empty = function() {};
        var n = new((_Empty).prototype = proto, _Empty);

        for(var i in o) {
            if(o.hasOwnProperty(i)) {
                n[i] = o[i];
            }
        }

        return n;
    };

    juicer.__cache = {};
    juicer.version = '0.4.0-dev';

    juicer.settings = {
        forstart:      /{@each\s*([\w\.]*?)\s*as\s*(\w*?)\s*(,\s*\w*?)?}/igm,
        forend:        /{@\/each}/igm,
        ifstart:       /{@if\s*([^}]*?)}/igm,
        ifend:         /{@\/if}/igm,
        elsestart:     /{@else}/igm,
        elseifstart:   /{@else if\s*([^}]*?)}/igm,
        interpolate:   /\${([\s\S]+?)}/igm,
        noneencode:    /\$\${([\s\S]+?)}/igm,
        inlinecomment: /{#[^}]*?}/igm,
        rangestart:    /{@each\s*(\w*?)\s*in\s*range\((\d+?),(\d+?)\)}/igm
    };

    juicer.options = {
        cache: true,
        strip: true,
        errorhandling: true,
        detection: true,
        _method: __creator({
            __escapehtml: __escapehtml,
            __throw: __throw
        }, this)
    };

    juicer.set = function(conf, value) {
        if(arguments.length === 2) {
            this.options[conf] = value;
            return;
        }
        
        if(conf === Object(conf)) {
            for(var i in conf) {
                if(conf.hasOwnProperty(i)) {
                    this.options[i] = conf[i];
                }
            }
        }
    };

    juicer.register = function(fname, fn) {
        var _method = this.options._method;

        if(_method.hasOwnProperty(fname)) {
            return false;
        }

        return _method[fname] = fn;
    };

    juicer.unregister = function(fname) {
        var _method = this.options._method;

        if(_method.hasOwnProperty(fname)) {
            return delete _method[fname];
        }
    };

    juicer.template = function(options) {
        var that = this;

        this.options = options;

        this.__interpolate = function(_name, _escape, options) {
            var _define = _name.split('|'), _fn = '';

            if(_define.length > 1) {
                _name = _define.shift();
                _fn = '_method.' + _define.shift();
            }

            return '<%= ' + (_escape ? '_method.__escapehtml.escaping' : '') + '(' +
                        (!options || options.detection !== false ? '_method.__escapehtml.detection' : '') + '(' +
                            _fn + '(' +
                                _name +
                            ')' +
                        ')' +
                    ')' +
                ' %>';
        };

        this.__removeShell = function(tpl, options) {
            var _counter = 0;
            
            tpl = tpl
                //for expression
                .replace(juicer.settings.forstart, function($, _name, alias, key) {
                    var alias = alias || 'value', key = key && key.substr(1);
                    var _iterate = 'i' + _counter++;
                    return '<% for(var ' + _iterate + '=0, l' + _iterate + '=' + _name + '.length;' + _iterate + '<l' + _iterate + ';' + _iterate + '++) {' +
                                'var ' + alias + '=' + _name + '[' + _iterate + '];' +
                                (key ? ('var ' + key + '=' + _iterate + ';') : '') +
                        ' %>';
                })
                .replace(juicer.settings.forend, '<% } %>')

                //if expression
                .replace(juicer.settings.ifstart, function($, condition) {
                    return '<% if(' + condition + ') { %>';
                })
                .replace(juicer.settings.ifend, '<% } %>')

                //else expression
                .replace(juicer.settings.elsestart, function($) {
                    return '<% } else { %>';
                })

                //else if expression
                .replace(juicer.settings.elseifstart, function($, condition) {
                    return '<% } else if(' + condition + ') { %>';
                })

                //interpolate without escape
                .replace(juicer.settings.noneencode, function($, _name) {
                    return that.__interpolate(_name, false, options);
                })

                //interpolate with escape
                .replace(juicer.settings.interpolate, function($, _name) {
                    return that.__interpolate(_name, true, options);
                })

                //clean up comments
                .replace(juicer.settings.inlinecomment, '')

                //range expression
                .replace(juicer.settings.rangestart, function($, _name, start, end) {
                    var _iterate = 'j' + _counter++;
                    return '<% for(var ' + _iterate + '=0;' + _iterate + '<' + (end - start) + ';' + _iterate + '++) {' +
                                'var ' + _name + '=' + _iterate + ';' +
                        ' %>';
                });

            //exception handling
            if(!options || options.errorhandling !== false) {
                tpl = '<% try { %>' + tpl;
                tpl += '<% } catch(e) {_method.__throw("Juicer Render Exception: "+e.message);} %>';
            }

            return tpl;
        };

        this.__toNative = function(tpl, options) {
            return this.__convert(tpl, !options || options.strip);
        };

        this.__lexicalAnalyze = function(tpl) {
            var buffer = [];
            var prefix = '';

            var indexOf = function(array, item) {
                if (Array.prototype.indexOf && array.indexOf === Array.prototype.indexOf) {
                    return array.indexOf(item);
                }
                
                for(var i=0; i < array.length; i++) {
                    if(array[i] === item) return i;
                }
                
                return -1;
            };

            var variableAnalyze = function($, statement) {
                statement = statement.match(/\w+/igm)[0];
                
                if(indexOf(buffer, statement) === -1) {
                    buffer.push(statement); //fuck ie
                }
            };

            tpl.replace(juicer.settings.forstart, variableAnalyze).
                replace(juicer.settings.interpolate, variableAnalyze).
                replace(juicer.settings.ifstart, variableAnalyze);

            for(var i = 0;i < buffer.length; i++) {
                prefix += 'var ' + buffer[i] + '=_.' + buffer[i] + ';';
            }
            return '<% ' + prefix + ' %>';
        };
        
        this.__convert=function(tpl, strip) {
            var buffer = [].join('');

            buffer += "'use strict';"; //use strict mode
            buffer += "var _=_||{};";
            buffer += "var _out='';_out+='";

            if(strip !== false) {
                buffer += tpl
                    .replace(/\\/g, "\\\\")
                    .replace(/[\r\t\n]/g, " ")
                    .replace(/'(?=[^%]*%>)/g, "\t")
                    .split("'").join("\\'")
                    .split("\t").join("'")
                    .replace(/<%=(.+?)%>/g, "';_out+=$1;_out+='")
                    .split("<%").join("';")
                    .split("%>").join("_out+='")+
                    "';return _out;";

                return buffer;
            }

            buffer += tpl
                    .replace(/\\/g, "\\\\")
                    .replace(/[\r]/g, "\\r")
                    .replace(/[\t]/g, "\\t")
                    .replace(/[\n]/g, "\\n")
                    .replace(/'(?=[^%]*%>)/g, "\t")
                    .split("'").join("\\'")
                    .split("\t").join("'")
                    .replace(/<%=(.+?)%>/g, "';_out+=$1;_out+='")
                    .split("<%").join("';")
                    .split("%>").join("_out+='")+
                    "';return _out.replace(/[\\r\\n]\\s+[\\r\\n]/g, '\\r\\n');";
                    
            return buffer;
        };

        this.parse = function(tpl, options) {
            var _that = this;

            if(!options || options.loose !== false) {
                tpl = this.__lexicalAnalyze(tpl) + tpl;
            }
            
            tpl = this.__removeShell(tpl, options);
            tpl = this.__toNative(tpl, options);

            this._render = new Function('_, _method', tpl);

            this.render = function(_, _method) {
                if(!_method || _method !== that.options._method) {
                    _method = __creator(_method, that.options._method);
                }

                return _that._render.call(this, _, _method);
            };

            return this;
        };
    };

    juicer.compile = function(tpl, options) {
        if(!options || options !== this.options) {
            options = __creator(options, this.options);
        }

        try {
            var engine = this.__cache[tpl] ? 
                this.__cache[tpl] : 
                new this.template(this.options).parse(tpl, options);
            
            if(!options || options.cache !== false) {
                this.__cache[tpl] = engine;
            }
            
            return engine;

        } catch(e) {
            __throw('Juicer Compile Exception: ' + e.message);
            
            return {
                render: function() {} //noop
            };
        }
    };

    juicer.to_html = function(tpl, data, options) {
        if(!options || options !== this.options) {
            options = __creator(options, this.options);
        }

        return this.compile(tpl, options).render(data, options._method);
    };

    typeof(module) !== 'undefined' && module.exports ? module.exports = juicer : this.juicer = juicer;
})();