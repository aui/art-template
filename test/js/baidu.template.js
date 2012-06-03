/**
*占用命名空间  baidu.template
*@param str {String|HtmlElement} dom结点ID,dom，或者模板string
*@param data {Object} 需要渲染的json对象，可以为空。
*@return 如果无data，直接返回函数，如果有data，返回html.
*@author  wangxiao 
*@email  1988wangxiao@gmail.com
*/

;(function(){

    //模板函数
    var bt = function(str, data){

        //检查是否有不是字母、-、：、.、的字符  即，检查是否是模板   W3C文档中规定，id的名字可由 字母 数字 冒号 横线 下划线 等组成
        var fn = !/[^\w-:.]/.test(str) ?

            //不是模板，看下缓存有没有数据，缓存没有数据则取到对应dom中的内容，调用模板引擎生成缓存函数
            cache[str] = cache[str] || 
            (function(){
                var ele=document.getElementById(str);
                var html='';
                
                //支持textarea情况  textarea或者input则取value
                if(ele && /^(textarea|input)$/i.test(ele.tagName)){
                    html=ele.value;
                }else{
                    html=ele.innerHTML;
                };
                
                //支持模板和id完全相同
                return compile(html);
            })() : 

            //是模板字符串，则生成一个函数
            compile(str);

        //有数据则返回HTML字符串，没有数据则返回函数
        return data ? fn( data ) : fn;
    };

    //取得命名空间 baidu.template
    baidu=window.baidu||{};
    baidu.template=bt;

    //缓存  将对应id模板生成的函数缓存下来。
    var cache = {};
    
    //自定义分隔符，可以含有正则中的字符，可以是HTML注释开头 <! !>
    bt.LEFT_DELIMITER=bt.LEFT_DELIMITER||'<%';
    bt.RIGHT_DELIMITER=bt.RIGHT_DELIMITER||'%>';

    //HTML转义
    bt._encodeHTML = function (source) {
        return String(source)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/\\/g,'&#92;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#39;');
    };

    //转义影响正则的字符
    bt._encodeReg = function (source) {
        return String(source)
            .replace(new RegExp("([.*+?^=!:\x24{}()|[\\]\/\\\\])", "g"), '\\\x241');
    };

    //转义UI UI变量使用在HTML页面标签onclick等事件函数参数中
    bt._encodeEventHTML = function (source) {
        return String(source)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#39;')
            .replace(/\\/g,'\\')
            .replace(/\//g,'\/')
            .replace(/\n/g,'\n')
            .replace(/\r/g,'\r');
    };

    //将字符串拼接生成函数，即编译过程(compile)
    var compile = function(str){
        return new Function("_template_object",
            "var _template_fun_array=[];"+"with(_template_object){_template_fun_array.push('"+analysisStr(str)+"');}return _template_fun_array.join('');"
        );
    };

    //解析模板字符串
    var analysisStr=function(str){

        //取得分隔符
        var _left_=bt.LEFT_DELIMITER;
        var _right_=bt.RIGHT_DELIMITER;

        //对分隔符进行转义，支持正则中的元字符，可以是HTML注释 <!  !>
        var _left=bt._encodeReg(_left_);
        var _right=bt._encodeReg(_right_);

        str=String(str)
            
            //用来处理非分隔符内部的内容中含有 斜杠 \ 单引号 ‘ ，处理办法为HTML转义
            .replace(new RegExp(_left+"(?:(?!"+_right+")[\\s\\S])*"+_right+"|((?:(?!"+_left+")[\\s\\S])+)","g"),function (item, $1) {
                return $1 ? $1.replace(/\\/g,"&#92;").replace(/'/g,'&#39;') : item ;
            })

            //去掉js注释
            .replace(new RegExp("\\/\\/.*?\\n","g"), "")

            //把所有换行去掉  \r回车符 \t制表符 \n换行符
            .replace(new RegExp("[\\r\\t\\n]","g"), "")

            //去掉注释内容  <%* 这里可以任意的注释 *%>
            //默认支持HTML注释，将HTML注释匹配掉的原因是用户有可能用 <! !>来做分割符
            .replace(new RegExp("<!--.*?-->", "g"),"")
            .replace(new RegExp(_left+"\\*.*?\\*"+_right, "g"),"")

            //对变量后面的分号做容错(包括转义模式 如<%:h=value%>)  <%=value;%> 排除掉函数的情况 <%fun1();%> 排除定义变量情况  <%var val='test';%>
            .replace(new RegExp("("+_left+":?[hvu]?[\\s]*?=[\\s]*?[^;|"+_right+"]*?);[\\s]*?"+_right,"g"),"$1"+_right_)

            //定义变量，如果没有分号，需要容错  <%var val='test'%>
            .replace(new RegExp("("+_left+"[\\s]*?var[\\s]*?.*?[\\s]*?[^;])[\\s]*?"+_right,"g"),"$1;"+_right_)

            //用来清理会报错的容易产生的无用间隔  如 <%if()%><%{%><%}%><%else%><%{%><%}%>
            .replace(new RegExp("(?:"+_right+_left+")?[\\s]*?\\{","g"),"{").replace(new RegExp("\\}[\\s]*?(?:"+_right+_left+")?[\\s]*?else\\b[\\s]*?(?:"+_right+_left+")?[\\s]*?\\{","g"),"}else{")

            //按照 <% 分割为一个个数组，再用 \t 和在一起，相当于将 <% 替换为 \t
            //将模板按照<%分为一段一段的，再在每段的结尾加入 \t,即用 \t 将每个模板片段前面分隔开
            .split(_left_).join("\t")

            //找到 不是\t开头并且以单引号结束的字符串 或者 从%>开始含有不是\t的字符并且以点结束的字符串
            .replace(new RegExp("((^|"+_right+")[^\\t]*)'","g"), "$1\\r")

            //找到 \t=任意一个字符%> 替换为 ‘，任意字符,'
            //即替换简单变量  \t=data%> 替换为 ',data,'
            //默认HTML转义  也支持HTML转义写法<%:h=value%>  
            .replace(new RegExp("\\t(?::h)?=(.*?)"+_right,"g"),"',typeof $1=='undefined'?'':baidu.template._encodeHTML($1),'")
        
            //支持不转义写法 <%:=value%>和<%-value%>
            .replace(new RegExp("\\t(?::=|-)(.*?)"+_right,"g"),"',typeof $1=='undefined'?'':$1,'")

            //支持url转义 <%:u=value%>
            .replace(new RegExp("\\t:u=(.*?)"+_right,"g"),"',typeof $1=='undefined'?'':encodeURIComponent($1),'")
            
            //支持UI 变量使用在HTML页面标签onclick等事件函数参数中  <%:v=value%>
            .replace(new RegExp("\\t:v=(.*?)"+_right,"g"),"',typeof $1=='undefined'?'':baidu.template._encodeEventHTML($1),'")

            //将字符串按照 \t 分成为数组，在用'); 将其合并，即替换掉结尾的 \t 为 ');
            //在if，for等语句前面加上 '); ，形成 ');if  ');for  的形式
            .split("\t").join("');")

            //将 %> 替换为_template_fun_array.push('
            //即去掉结尾符，生成函数中的push方法
            //如：if(list.length=5){%><h2>',list[4],'</h2>');}
            //会被替换为 if(list.length=5){_template_fun_array.push('<h2>',list[4],'</h2>');}
            .split(_right_).join("_template_fun_array.push('")

            //将 \r 替换为 \
            .split("\r").join("\\'");
        
        return str;
    };

})();