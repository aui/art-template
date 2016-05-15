'use strict';


var art = require('../');


describe('test', function() {

  it('! for pure exression', function() {
    var tpl = [
      '{{! var a = "hello world"}}',
      '{{a}}'
    ].join('');

    var fn = art.compile(tpl);
    fn({}).should.be.equal('hello world');
  });


  it('comment', function() {
    var tpl = [
      '{{// 这是个注释}}'
    ].join('');

    var fn = art.compile(tpl);
    fn({}).should.equal('');

    tpl = [
      '{{// ',
      '多行注释',
      '多行注释',
      '多行注释',
      '}}'
    ].join('');

    fn = art.compile(tpl);
    fn({}).should.equal('');
  });


  it('raw', function() {
    var raw = '<span>\nMes\\sa\'ge: {{ msg }}\n</span>';
    var tpl = [
      '{{{',
        raw,
      '}}}'
    ].join('');

    var fn = art.compile(tpl);
    fn({}).should.equal(raw);
  });

});

