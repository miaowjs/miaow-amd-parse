define(['bar#pack', 'Foo#pack'], function (bar, foo) {
  require(['foo#pack'], function (foo) {
  });
});
