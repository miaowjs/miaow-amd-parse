define([
  './id',
  'foo',
  'bar',
  'bar/lib/baz',
  './info.json',
  './style.css',
  './img.png'
], function (id, foo, bar, baz, info, style, img) {
  return 'depend';
});
