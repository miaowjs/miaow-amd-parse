define(function() {
  var style = '';
  var useCount = 0;

  var headElement;
  var firstLinkElement;
  var styleElement;

  function use() {
    if (useCount++ > 0) {
      return;
    }

    if (!headElement) {
      headElement = document.head || document.getElementsByTagName('head')[0];
    }

    if (!firstLinkElement) {
      var linkElements = headElement.getElementsByTagName('link');
      for (var i = 0, l = linkElements.length; i < l; ++i) {
        if (linkElements[i].rel === 'stylesheet') {firstLinkElement = linkElements[i]; break;}
      }
    }

    if (!styleElement) {
      styleElement = document.createElement('style');
      firstLinkElement ? headElement.insertBefore(styleElement, firstLinkElement) : headElement.appendChild(styleElement);
      styleElement.setAttribute('type', 'text/css');
      styleElement.setAttribute('data-src', '<%= src%>');
      if (styleElement.styleSheet) {
        styleElement.styleSheet.cssText = style;
      } else {
        styleElement.appendChild(document.createTextNode(style));
      }
    } else {
      firstLinkElement ? headElement.insertBefore(styleElement, firstLinkElement) : headElement.appendChild(styleElement);
    }
  }

  function unuse() {
    if (useCount === 0) {
      return;
    }

    if (--useCount === 0) {
      headElement.removeChild(styleElement);
    }
  }

  return {
    use: use,
    unuse: unuse,
    modules: <%= modules%>
  };
});
