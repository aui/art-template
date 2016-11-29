'use strict';


const is = require('is-type-of');
const art = require('../');


describe('test', function() {

  it('if expression', function() {
    const tpl = `
      {{if tag == 'a'}}
        A
      {{else if tag == 'b'}}
        B
      {{else}}
        C
      {{/if}}
    `;

    const fn = art.compile(tpl.trim());
    fn({ tag: 'a' }).trim().should.equal('A');
    fn({ tag: 'b' }).trim().should.equal('B');
    fn({ tag: 'c' }).trim().should.equal('C');
  });


  it('for expression', function() {
    const tpl = `
    {{each list as item index}}
      <li>{{index}} - {{item}}</li>
    {{/each}}
    `;

    const fn = art.compile(tpl.trim());
    const expect = `
      <li>0 - A</li>
      <li>1 - B</li>
      <li>2 - C</li>
    `;
    fn({ list: ['A', 'B', 'C'] }).replace(/\s{2,}/g, ' ')
      .should.equal(expect.replace(/\s{2,}/g, ' '));
  });


  it('! for pure exression', function() {
    const tpl = `
{{! var a = "hello world"}}
{{a}}
{{!
var b = 'hello arttemplate'
}}
{{b}}
    `;

    const fn = art.compile(tpl.trim());
    fn({}).trim().should.equal('hello world\n\nhello arttemplate');
  });


  it('comment with //', function() {
    const tpl = '{{// 这是个注释}}'

    const fn = art.compile(tpl);
    fn({}).should.equal('');

    const tpl2 = `
{{//
多行注释
多行注释
多行注释
}}
    `;

    const fn2 = art.compile(tpl2.trim());
    fn2({}).should.equal('');
  });


  it('use \\{{ and \\}} to output {{ and }}', function() {
    const tpl = '<span>Message: \\{{ msg \\}} - \\{{ </span>';
    const fn = art.compile(tpl);
    fn({}).should.equal('<span>Message: {{ msg }} - {{ </span>');

    const tpl2 = 'output special \\}}';
    const fn2 = art.compile(tpl2);
    fn2({}).should.equal('output special }}');
  });


  it('compress', function() {
    const tpl = `
<div>
  {{title}}
  <ul>
    <li>item</li>
  </ul>
</div>
    `;

    const fn = art.compile(tpl.trim(), { compress: true });
    const expect = `
<div>
Hello
<ul>
<li>item</li>
</ul>
</div>
    `;
    fn({ title: 'Hello' }).should.equal(expect.trim());
  });


  it('include', function() {
    const tpl = `
      <ul>
        {{each list as item}}
        {{include('item', { item: item })}}
        {{/each}}
      </ul>
    `;

    const utils = Object.assign({}, art.utils, {
      $include: function(name, data) {
        return `<li>include ${name} ${JSON.stringify(data)}</li>`
      }
    });

    const expect = `
      <ul>
        <li>include item {"item":"a"}</li>
        <li>include item {"item":"b"}</li>
        <li>include item {"item":"c"}</li>
        <li>include item {"item":"d"}</li>
      </ul>
    `;
    const list = ['a', 'b', 'c', 'd'];

    const fn = art.compile(tpl, { utils: utils });
    equal(fn({ list: list }), expect);
  });


  it('with inspect', function() {
    const tpl = `
      <div>
        {{name}}
      </div>
      <div>
        {{=name}}
      </div>
      <div>
        {{async(123)}}
      </div>
      {{=async(234)}}
    `;


    const helper = function(value, ctx) {
      if (is.promise(value)) {
        const depends = ctx.depends || (ctx.depends = []);
        depends.push(value);
        return 'deferred ' + depends.length;
      }
      return value;
    };

    const utils = {
      $escape: helper,
      $string: helper,
      $output: function(body, ctx) {
        return {
          body: body,
          ctx: ctx
        };
      }
    };


    function async(value) {
      return Promise.resolve('async ' + value);
    }

    const fn = art.compile(tpl, { inspect: true, utils: utils });
    const o = fn({ name: 'plover', async: async });
    const expect = `
      <div>
        plover
      </div>
      <div>
        plover
      </div>
      <div>
        deferred 1
      </div>
      deferred 2
    `;

    o.body.should.equal(expect);
    o.ctx.depends.length.should.equal(2);
  });


  it('include with inspect ', function() {
    const tpl = `
      <div>
        {{include('data')}}
      </div>
    `;

    const utils = Object.assign({}, art.utils, {
      $include: function(name, data, ctx) {
        return name + ' ' + JSON.stringify(ctx.data);
      }
    });

    const fn = art.compile(tpl, { utils: utils, inspect: true });
    const expect = `
      <div>
        data {"name":"arttemplate"}
      </div>
    `;
    equal(fn({ name: "arttemplate" }), expect);
  });


  it('comment with expression', function() {
    const tpl = `
    {{!
      // asss
      src = 1111;
      var a = 1;
      if (!showIndexInPage < 2) {
        // 首屏直接显示220图片
        src = 2222;
      }
    }}
    {{src}}
    `;

    const fn = art.compile(tpl);
    fn({ showIndexInPage: 3 }).trim().should.equal('2222');
  });
});


function equal(a, b) {
  a.replace(/\s+/g, ' ').should.equal(b.replace(/\s+/g, ' '));
}

