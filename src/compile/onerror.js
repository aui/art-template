const onerror = e => {
    var message = 'Template Error\n\n';
    for (var name in e) {
        message += '<' + name + '>\n' + e[name] + '\n\n';
    }

    if (typeof console === 'object') {
        console.error(message);
    }

    return () => '{Template Error}';
};

module.exports = onerror;