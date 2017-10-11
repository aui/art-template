(function(){
  'use strict';

  var elements = document.getElementsByClassName('plugin');
  var $count = document.getElementById('plugin-list-count');
  var $input = document.getElementById('plugin-search-input');
  var elementLen = elements.length;
  var index = lunr.Index.load(window.SEARCH_INDEX);

  function updateCount(count){
    $count.innerHTML = count + (count === 1 ? ' item' : ' items');
  }

  function addClass(elem, className){
    var classList = elem.classList;

    if (!classList.contains(className)){
      classList.add(className);
    }
  }

  function removeClass(elem, className){
    var classList = elem.classList;

    if (classList.contains(className)){
      classList.remove(className);
    }
  }

  function search(value){
    var result = index.search(value);
    var len = result.length;
    var selected = {};
    var i = 0;

    for (i = 0; i < len; i++){
      selected[result[i].ref] = true;
    }

    for (i = 0; i < elementLen; i++){
      if (selected[i]){
        addClass(elements[i], 'on');
      } else {
        removeClass(elements[i], 'on');
      }
    }

    updateCount(len);
  }

  function displayAll(){
    for (var i = 0; i < elementLen; i++){
      addClass(elements[i], 'on');
    }

    updateCount(elements.length);
  }

  function hashchange(){
    var hash = location.hash.substring(1);
    $input.value = hash;

    if (hash){
      search(hash);
    } else {
      displayAll();
    }
  }

  $input.addEventListener('input', function(){
    var value = this.value;

    if (!value) return displayAll();
    search(value);
  });

  window.addEventListener('hashchange', hashchange);
  hashchange();
})();