(function () {
  'use strict';

  if (debug) {
    console.log('true');
  }

  define(['bar', './foo/foo', 'fob'], function (bar, foo) {
    return 'baz';
  });
})();
