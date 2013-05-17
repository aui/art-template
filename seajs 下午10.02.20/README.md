artTemplate for [SeaJS](http://seajs.org/)
---


## Installation

1. 在 SeaJS 的 `base` 路径处新建一个目录 `artTemplate`
2. 把 `transport.js` 和 `transport-extensions.js` 拷贝到这个目录
3. 然后：

```
$ cd path/to/artTemplate
$ spm transport transport.js
$ spm transport transport-extensions.js
```


## Usage

```
seajs.config({
  alias: {
    'template': 'artTemplate/1.1.0/template',
    'template-extensions': 'artTemplate/1.1.0/template-extensions'
  }
});
```

```javascript
seajs.use('template', function(template) {
  var tpl = '<% for (var i = 0, len = users.length; i < len; i++) { %>' +
              '<p><em><%= users[i].name %></em>：<%= users[i].blog %></p>' +
            '<% } %>';

  var render = template(tpl);

  var html = render({
    users: [
      {
        name: '糖饼',
        blog: 'http://www.planeart.cn/'
      },
      {
        name: 'wǒ_is神仙',
        blog: 'http://MrZhang.me/'
      }
    ]
  });

  document.body.innerHTML = html;
});
```

```javascript
seajs.use(['template', 'template-extensions'], function(template) {
  var tpl = '{ each users as user }' +
              '<p><em>{ user.name }</em>：{ user.weibo }</p>' +
            '{ /each }';

  var render = template(tpl);

  var html = render({
    users: [
      {
        name: '糖饼',
        weibo: 'http://weibo.com/planeart'
      },
      {
        name: 'wǒ_is神仙',
        weibo: 'http://weibo.com/jsw0528'
      }
    ]
  });

  document.body.innerHTML = html;
});
```
