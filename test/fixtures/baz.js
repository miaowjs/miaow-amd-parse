(function () {
  'use strict';

  if (debug) {
    console.log('true');
  }

  define(['bar', './foo/foo', 'fob', 'fob/lib/foc'], function (bar, foo, foc) {
    return 'baz';
  });
})();
