define(['bar#pack', 'foo#pack'], function (bar, foo) {
  require(['foo#pack'], function (foo) {
  });
});
