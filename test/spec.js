'use strict';


const art = require('../');


describe('test', function() {

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
    fn({}).trim().should.be.equal('hello world\n\nhello arttemplate');
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


  it('inspect $out', function() {
    const tpl =`
    <div>
      {{app.control('item')}}
    </div>
    <div>
      {{app.view('offer')}}
    </div>
    `;
    const fn = art.compile(tpl.trim(), { compress: true });
    console.log(fn.toString());
  });
});

