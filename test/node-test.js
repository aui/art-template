var template = require('../src/template.js');


var fn = function () {
    return 'a' + 'b' + 'c' + 'd' + 'e' + 'f';
}

var fn2 = function () {
    return 'a'.concat('b', 'c', 'd', 'e', 'f');
}

console.time('test');
for (var i = 0; i < 999999; i ++) {
    fn()
}
console.timeEnd('test');

console.time('test2');
for (var i = 0; i < 999999; i ++) {
    fn2()
}
console.timeEnd('test2');