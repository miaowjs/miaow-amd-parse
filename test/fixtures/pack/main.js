define(['jquery', 'bar', 'bar/lib/baz', 'bar/other'], function (bar, foo) {
  require(['foo'], function (foo) {
  });
});
