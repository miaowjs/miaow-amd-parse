define([
  './id',
  'foo',
  'bar',
  'bar/lib/baz',
  './info.json',
  './style.css',
  './img.png',
  './template.tpl#content'
], function (id, foo, bar, baz, info, style, img, template) {
  return 'depend';
});
