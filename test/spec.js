var art = require('../');


describe('test', function() {

    it('should support ! for pure exression', function() {
        var tpl = [
            '{{! var a = "hello world"}}',
            '{{a}}'
        ].join('');

        var fn = art.compile(tpl);
        fn({}).should.be.equal('hello world');
    });


    it('should support comment', function() {
        var tpl = [
            '{{// 这是个注释}}',
        ].join('');
        var fn = art.compile(tpl);
        fn({}).should.equal('');

        tpl = [
            '{{// ',
            '多行注释',
            '多行注释',
            '多行注释',
            '}}'
        ].join('\n');

        fn = art.compile(tpl);
        fn({}).should.equal('');
    });

});

