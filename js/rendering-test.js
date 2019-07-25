var templateList = {};

templateList['template'] = `
<ul>
    <% for (var i = 0, l = list.length; i < l; i ++) { %>
        <li>User: <%= list[i].user %> / Web Site: <%= list[i].site %></li>
    <% } %>
</ul>`;

templateList['template-raw'] = `
<ul>
    <% for (var i = 0, l = list.length; i < l; i ++) { %>
        <li>User: <%- list[i].user %> / Web Site: <%- list[i].site %></li>
    <% } %>
</ul>`;

templateList['template-fast-mode'] = `
<ul>
    <% for (var i = 0, l = $data.list.length; i < l; i ++) { %>
        <li>User: <%= $data.list[i].user %> / Web Site: <%= $data.list[i].site %></li>
    <% } %>
</ul>`;

templateList['template-fast-mode-raw'] = `
<ul>
    <% for (var i = 0, l = $data.list.length; i < l; i ++) { %>
        <li>User: <%- $data.list[i].user %> / Web Site: <%- $data.list[i].site %></li>
    <% } %>
</ul>`;

templateList['pug'] = `
ul
    -for (var i = 0, l = list.length; i < l; i ++) {
        li User: #{list[i].user} / Web Site: #{list[i].site}
    -}`;

templateList['pug-raw'] = `
ul
    -for (var i = 0, l = list.length; i < l; i ++) {
        li User: !{list[i].user} / Web Site: !{list[i].site}
    -}`;

templateList['dot'] = `
<ul>
    {{ for (var i = 0, l = it.list.length; i < l; i ++) { }}
        <li>User: {{!it.list[i].user}} / Web Site: {{!it.list[i].site}}</li>
    {{ } }}
</ul>`;

templateList['dot-raw'] = `
<ul>
    {{ for (var i = 0, l = it.list.length; i < l; i ++) { }}
        <li>User: {{=it.list[i].user}} / Web Site: {{=it.list[i].site}}</li>
    {{ } }}
</ul>`;

templateList['mustache'] = `
<ul>
    {{#list}}
        <li>User: {{user}} / Web Site: {{site}}</li>
    {{/list}}
</ul>`;

templateList['mustache-raw'] = `
<ul>
    {{#list}}
        <li>User: {{{user}}} / Web Site: {{{site}}}</li>
    {{/list}}
</ul>`;

templateList['handlebars'] = `
<ul>
    {{#list}}
        <li>User: {{user}} / Web Site: {{site}}</li>
    {{/list}}
</ul>`;

templateList['handlebars-raw'] = `
<ul>
    {{#list}}
        <li>User: {{{user}}} / Web Site: {{{site}}}</li>
    {{/list}}
</ul>`;

templateList['swig'] = `
<ul>
    {% for key, value in list %}
        <li>User: {{value.user}} / Web Site: {{value.site}}</li>
    {% endfor %}
</ul>`;

templateList['swig-raw'] = `
<ul>
    {% for key, value in list %}
        {% autoescape false %}<li>User: {{value.user}} / Web Site: {{value.site}}</li>{% endautoescape %}
    {% endfor %}
</ul>`;


/*-----------------*/


var config = {
    // 列表条数
    length: 20,
    // 渲染次数
    calls: 2048,
    // 是否编码
    escape: true
};

if (location.search) {
    var param = decodeURIComponent(location.search);
    param = param.replace(/.*\btest=({[^}]*}).*?/, '$1');
    try {
        config = JSON.parse(param);
    } catch (e) {
        console.error(e);
    }
}


// 制造测试数据
var data = {
    list: []
};

for (var i = 0; i < config.length; i++) {
    data.list.push({
        index: i,
        user: '<strong style="color:red">糖饼</strong>',
        site: 'https://github.com/aui',
        weibo: 'http://weibo.com/planeart',
        QQweibo: 'http://t.qq.com/tangbin'
    });
};


// 待测试的引擎列表
var testList = [

    {
        name: 'art-template',
        tester: function () {
            var id = config.escape ? 'template' : 'template-raw';
            var source = templateList[id];
            var fn = template.compile(source);
            var html = '';
            for (var i = 0; i < config.calls; i++) {
                html = fn(data);
            }
            return html;
        }
    },

    {
        name: 'art-template / fast mode',
        tester: function () {
            var id = config.escape ? 'template-fast-mode' : 'template-fast-mode-raw';
            var source = templateList[id];
            var fn = template.compile(source);
            var html = '';
            for (var i = 0; i < config.calls; i++) {
                html = fn(data);
            }
            return html;
        }
    },

    {
        name: 'doT',
        tester: function () {
            id = config.escape ? 'dot' : 'dot-raw';
            var source = templateList[id];
            var fn = doT.template(source);
            var html = '';
            for (var i = 0; i < config.calls; i++) {
                html = fn(data);
            }
            return html;
        }
    },

    {
        name: 'ejs',
        tester: function () {
            var id = config.escape ? 'template' : 'template-raw';
            var source = templateList[id];
            var fn = ejs.compile(source);
            var html = '';
            for (var i = 0; i < config.calls; i++) {
                html = fn(data);
            }
            return html;
        }
    },

    {
        name: 'Jade / pug',
        tester: function () {
            var id = config.escape ? 'pug' : 'pug-raw';
            var source = templateList[id];
            var pug = require('pug');
            var fn = pug.compile(source);
            var html = '';
            for (var i = 0; i < config.calls; i++) {
                html = fn(data);
            }
            return html;
        }
    },

    {
        name: 'Handlebars',
        tester: function () {
            var id = config.escape ? 'handlebars' : 'handlebars-raw';
            var source = templateList[id];
            var fn = Handlebars.compile(source);
            var html = '';
            for (var i = 0; i < config.calls; i++) {
                html = fn(data);
            }
            return html;
        }
    },

    {
        name: 'Mustache',
        tester: function () {
            var id = config.escape ? 'mustache' : 'mustache-raw';
            var source = templateList[id];
            var html = '';
            for (var i = 0; i < config.calls; i++) {
                html = Mustache.to_html(source, data);
            }
            return html;
        }
    },

    {
        name: 'swig',
        tester: function () {
            var id = config.escape ? 'swig' : 'swig-raw';
            var source = templateList[id];
            var fn = swig.compile(source);
            var html = '';
            for (var i = 0; i < config.calls; i++) {
                html = fn(data);
            }
            return html;
        }

    }
];



Highcharts.setOptions({
    colors: ['#EF6F65', '#F3AB63', '#F8D56F', '#99DD7A', '#74BBF3', '#CB93E0', '#A2A2A4', '#E1AC65', '#6AF9C4']
});


var runTest = function (callback) {

    var list = testList.filter(function (test) {
        return !config.escape || test.supportEscape !== false;
    });

    var Timer = function () {
        this.startTime = +new Date;
    };

    Timer.prototype.stop = function () {
        return +new Date - this.startTime;
    };

    var colors = Highcharts.getOptions().colors;
    var categories = [];

    for (var i = 0; i < list.length; i++) {
        categories.push(list[i].name);
    }

    var chart = new Highcharts.Chart({
        chart: {
            animation: {
                duration: 150
            },
            renderTo: 'test-container',
            height: categories.length * 32,
            type: 'bar'
        },

        title: false,

        // subtitle: {
        //     text: config.length + ' list × ' + config.calls + ' calls'
        // },

        xAxis: {
            categories: categories,
            labels: {}
        },

        yAxis: {
            min: 0,
            title: {
                text: 'Time'
            }
        },

        legend: {
            enabled: false
        },

        tooltip: {
            formatter: function () {
                return '<b>' + this.x + '</b><br/>' +
                    this.y + 'ms';
            }

        },

        credits: {
            enabled: false
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return this.y + 'ms';
                    }
                }
            },
        },
        series: [{
            data: []
        }]

    });

    var tester = function (target) {


        var time = new Timer;
        var html = target.tester();
        console.log(target.name + '------------------\n', html);
        var endTime = time.stop();

        chart.series[0].addPoint({
            color: colors.shift(),
            y: endTime
        });


        if (!list.length) {
            callback();
            return;
        }

        target = list.shift();

        setTimeout(function () {
            tester(target);
        }, 500);

    };

    var target = list.shift();
    tester(target);

};

var restart = function (key, value) {
    config[key] = value;
    var data = JSON.stringify(config);
    data = encodeURIComponent(data);
    location.search = 'test=' + data;
}


function app(selector) {
    var app = document.querySelector(selector);
    var body = (`
<h1>Rendering test</h1>
<div class="header">
    <p class="item">
        <button id="button-start" class="button">Run Test&raquo;</button>
        <button id="button-restart" class="button" style="display:none">Restart</button>
        <span>config: </span>
        <label><input type="number" value="{{length}}" onchange="restart('length', this.value)"> list</label>
        <strong>×</strong>
        <label><input type="number" value="{{calls}}" onchange="restart('calls', this.value)"> calls</label>
        <label><input type="checkbox" {{if escape}}checked{{/if}} onchange="restart('escape', this.checked)"> escape</label>
        <label><input type="checkbox" checked disabled> cache</label>
    </p>
    <p class="item">
    </p>
</div>
<div id="test-container" style="min-width: 400px; margin: 0 auto"></div>`);

    var data = Object.create(config);
    data.testList = testList;
    app.innerHTML = template.render(body, data);

    document.getElementById('button-start').onclick = function () {
        var elem = this;
        this.disabled = true;
        runTest(function () {
            elem.style.display = 'none';
            document.getElementById('button-restart').style.display = '';
        });
    };

    document.getElementById('button-restart').onclick = function () {
        location.reload();
    };
}