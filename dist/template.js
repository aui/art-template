/*!art-template - Template Engine | http://aui.github.com/artTemplate/*/
!function(){function a(a){return a.replace(u,"").replace(v,",").replace(w,"").replace(x,"").replace(y,"").split(z)}function b(a){return"'"+a.replace(/('|\\)/g,"\\$1").replace(/\r/g,"\\r").replace(/\n/g,"\\n")+"'"}function c(a){var b=[];return s(a,function(a,c){b[c]=a.replace(/([()\\|$\^*?.+\[\]\{\}\/])/g,"\\$1")}),new RegExp(b.join("|"),"g")}function d(d,e){function f(a){return n+=a.split(/\n/).length-1,l&&(a=a.replace(/\s+/g," ").replace(/<!--[\w\W]*?-->/g,"")),a&&(a=t[1]+b(a)+t[2]+"\n"),a}function g(b){var c=n;if(k?b=k(b,e):h&&(b=b.replace(/\n/g,function(){return n++,"$line="+n+";"})),0===b.indexOf("=")){var d=m&&!/^=[=#]/.test(b);if(b=b.replace(/^=[=#]?|[\s;]*$/g,""),d){var f=b.replace(/\s*\([^\)]+\)/,"");o[f]||/^(include|print)$/.test(f)||(b="$escape("+b+")")}else b="$string("+b+")";b=t[1]+b+t[2]}return h&&(b="$line="+c+";"+b),s(a(b),function(a){if(a&&!q[a]){var b;b="print"===a?v:"include"===a?w:o[a]?"$utils."+a:p[a]?"$helpers."+a:"$data."+a,x+=a+"="+b+",",q[a]=!0}}),b+"\n"}var h=e.debug,i=e.openTag,j=e.closeTag,k=e.parser,l=e.compress,m=e.escape,n=1,q={$data:1,$filename:1,$utils:1,$helpers:1,$out:1,$line:1},r="".trim,t=r?["$out='';","$out+=",";","$out"]:["$out=[];","$out.push(",");","$out.join('')"],u=r?"$out+=text;return $out;":"$out.push(text);",v="function(){var text=''.concat.apply('',arguments);"+u+"}",w="function(filename,data){data=data||$data;var text=$utils.$include(filename,data,$filename);"+u+"}",x="'use strict';var $utils=this,$helpers=$utils.$helpers,"+(h?"$line=0,":""),y=t[0],z="return new String("+t[3]+");";i.join&&(i=c(i)),j.join&&(j=c(j)),s(d.split(i),function(a){a=a.split(j);var b=a[0],c=a[1];1===a.length?y+=f(b):(y+=g(b),c&&(y+=f(c)))});var A=x+y+z;h&&(A="try{"+A+"}catch(e){throw {filename:$filename,name:'Render Error',message:e.message,line:$line,source:"+b(d)+".split(/\\n/)[$line-1].replace(/^\\s+/,'')};}");try{var B=new Function("$data","$filename",A);return B.prototype=o,B}catch(C){throw C.temp="function anonymous($data,$filename) {"+A+"}",C}}var e=function(a,b){return"string"==typeof b?r(b,{filename:a}):h(a,b)};e.version="3.0.0",e.config=function(a,b){f[a]=b};var f=e.defaults={openTag:"<%",closeTag:"%>",escape:!0,cache:!0,compress:!1,parser:null},g=e.cache={};e.render=function(a,b){return r(a,b)};var h=e.renderFile=function(a,b){var c=e.get(a)||q({filename:a,name:"Render Error",message:"Template not found"});return b?c(b):c};e.get=function(a){var b;if(g[a])b=g[a];else if("object"==typeof document){var c=document.getElementById(a);if(c){var d=(c.value||c.innerHTML).replace(/^\s*|\s*$/g,"");b=r(d,{filename:a})}}return b};var i=function(a,b){return"string"!=typeof a&&(b=typeof a,"number"===b?a+="":a="function"===b?i(a.call(a)):""),a},j={"<":"&#60;",">":"&#62;",'"':"&#34;","'":"&#39;","&":"&#38;"},k=function(a){return j[a]},l=function(a){return i(a).replace(/&(?![\w#]+;)|[<>"']/g,k)},m=Array.isArray||function(a){return"[object Array]"==={}.toString.call(a)},n=function(a,b){var c,d;if(m(a))for(c=0,d=a.length;d>c;c++)b.call(a,a[c],c,a);else for(c in a)b.call(a,a[c],c)},o=e.utils={$helpers:{},$include:h,$string:i,$escape:l,$each:n};e.helper=function(a,b){p[a]=b};var p=e.helpers=o.$helpers;e.onerror=function(a){var b="Template Error\n\n";for(var c in a)b+="<"+c+">\n"+a[c]+"\n\n";"object"==typeof console&&console.error(b)};var q=function(a){return e.onerror(a),function(){return"{Template Error}"}},r=e.compile=function(a,b){function c(c){try{return new i(c,h)+""}catch(d){return b.debug?q(d)():(b.debug=!0,r(a,b)(c))}}b=b||{};for(var e in f)void 0===b[e]&&(b[e]=f[e]);var h=b.filename;try{var i=d(a,b)}catch(j){return j.filename=h||"anonymous",j.name="Syntax Error",q(j)}return c.prototype=i.prototype,c.toString=function(){return i.toString()},h&&b.cache&&(g[h]=c),c},s=o.$each,t="break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if,in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with,abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto,implements,import,int,interface,long,native,package,private,protected,public,short,static,super,synchronized,throws,transient,volatile,arguments,let,yield,undefined",u=/\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g,v=/[^\w$]+/g,w=new RegExp(["\\b"+t.replace(/,/g,"\\b|\\b")+"\\b"].join("|"),"g"),x=/^\d[^,]*|,\d[^,]*/g,y=/^,+|,+$/g,z=/^$|,+/;f.openTag="{{",f.closeTag="}}";var A=function(a,b){var c=b.split(":"),d=c.shift(),e=c.join(":")||"";return e&&(e=", "+e),"$helpers."+d+"("+a+e+")"};f.parser=function(a){a=a.replace(/^\s+/,"");var b=a.split(" "),c=b.shift(),d=b.join(" ");switch(c){case"if":a="if("+d+"){";break;case"else":b="if"===b.shift()?" if("+b.join(" ")+")":"",a="}else"+b+"{";break;case"/if":a="}";break;case"each":var f=b[0]||"$data",g=b[1]||"as",h=b[2]||"$value",i=b[3]||"$index",j=h+","+i;"as"!==g&&(f="[]"),a="$each("+f+",function("+j+"){";break;case"/each":a="});";break;case"echo":a="print("+d+");";break;case"print":case"include":a=c+"("+b.join(",")+");";break;default:if(/^\s*\|\s*[\w\$]/.test(d)){var k=!0;0===a.indexOf("#")&&(a=a.substr(1),k=!1);for(var l=0,m=a.split("|"),n=m.length,o=m[l++];n>l;l++)o=A(o,m[l]);a=(k?"=":"=#")+o}else a=e.helpers[c]?"=#"+c+"("+b.join(",")+");":"="+a}return a},"function"==typeof define?define(function(){return e}):"undefined"!=typeof exports?module.exports=e:this.template=e}();