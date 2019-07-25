(function(){
  'use strict';

  function changeLang(){
    var root = this.dataset.root;
    var lang = this.dataset.lang;
    var canonical = this.dataset.canonical;
    var target = this.value === 'en' ? '' : this.value + '/';
    location.href = root + target + canonical;
  }

  document.getElementById('lang-select').addEventListener('change', changeLang);
  document.getElementById('mobile-lang-select').addEventListener('change', changeLang);
})();