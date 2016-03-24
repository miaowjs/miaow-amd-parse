var foo = 'foo';

define([foo], function (foo) {
  console.log(foo);
});

require([foo], function (foo) {
  console.log(foo);
});
