define(['bar', 'bar/lib/baz'], function (bar, foo) {
  require(['foo'], function (foo) {
  });
});