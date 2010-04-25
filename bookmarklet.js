// $Id$

/*global window,jQuery */

"use strict";

var DrupalBookmarklet;

/**
 * DrupalBookmarklet
 * @constructor
 *
 * Constructor loads all the required scripts in a specific sequence. The jQuery
 * plugins must be loaded before the noConflict function is called or else they
 * may be attached to some other jQuery instance.
 */
DrupalBookmarklet = function (host, path) {
  this.host = host;
  this.path = path;
  this.settings = {};
  this.dialog = {};

  this.createScript('http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.js', function () {
    var ajaxOptions;

    ajaxOptions = {
      type: "GET",
      dataType: "script",
      context: this,
      global: false
    };

    // Load jQuery UI.
    $.ajax($.extend({
      url: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/jquery-ui.js',
      success: function () {

        $.ajax($.extend({

          // Load jQuery postMessage plugin.
          url: this.host + '/' + this.path + '/jquery-postmessage/jquery.ba-postmessage.js',
          success: function () {
            this.jQuery = jQuery.noConflict(true);
            this.setupBookmarklet();
          }
        }, ajaxOptions));

      }
    }, ajaxOptions));

  });
};

/**
 * @see jQuery.getScript()
 * @see jQuery.ajax()
 */
DrupalBookmarklet.prototype.createScript = function (src, callback) {
  var bookmarklet = this,
    head = document.getElementsByTagName("head")[0] || document.documentElement,
    script = document.createElement("script"),
    // Handle Script loading
    done = false;

  script.src = src;
  script.charset = "utf-8";

  // Attach handlers for all browsers
  script.onload = script.onreadystatechange = function () {
    if (!done && (!this.readyState ||
        this.readyState === "loaded" || this.readyState === "complete")) {
      done = true;
      callback.call(bookmarklet);

      // Handle memory leak in IE
      script.onload = script.onreadystatechange = null;
      if (head && script.parentNode) {
        head.removeChild(script);
      }
    }
  };

  // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
  // This arises when a base node is used (#2709 and #4378).
  head.insertBefore(script, head.firstChild);
};

/**
 * Open mesage channel to iframe document, direct user to node form or login
 * form.
 */
DrupalBookmarklet.prototype.setupBookmarklet  = function () {
  var bookmarklet, $;
  bookmarklet = this;
  $ = this.jQuery;
  // newly loaded jQuery is attached to the bookmarklet object as the
  // jQuery method.
  this.setupMessageChannel();

  // Pull bookmarklet settings from Drupal callback.
  this.loadSettings(function () {
    var nodeType, params, url, settings;

    nodeType = bookmarklet.mapNodeType(location.href);
    params = {
      edit: bookmarklet.getPrepopulate(nodeType)
    };
    settings = bookmarklet.settings;

    // Anonymous users without permission to create nodes should be directed to
    // the login form.
    if (settings.authenticated === false && settings.types.length === 0) {
      $.extend(params, {
        q: 'user/login',
        destination: 'node/add/' + nodeType
      });
    }
    else {
      $.extend(params, {
        q: 'node/add/' + nodeType
      });
    }
    url = bookmarklet.iframeUrl(params);
    bookmarklet.loadStylesheet(bookmarklet.settings.stylesheet);
    bookmarklet.createBookmarklet(url);
    bookmarklet.setupButtons();

  });

};

/**
 * Load bookmarklet settings.
 */
DrupalBookmarklet.prototype.loadSettings = function (callback) {
  var bookmarklet, $, url, map;

  bookmarklet = this;
  $ = this.jQuery;
  url = this.host + '/?' + $.param({ q: 'bookmarklet/js' }) + '&callback=?';

  $.getJSON(url, function (json) {

    // Set instance settings.
    bookmarklet.settings = json;

    // Clone then empty URL map. It needs to be reconstituted as regexp objects.
    map = $.extend({}, bookmarklet.settings.urlMap);
    bookmarklet.settings.urlMap = [];

    $.each(map, function (exp, types) {
      var splits;
      splits = exp.split(exp.charAt(0));
      $.each(types, function (index, value) {
        bookmarklet.settings.urlMap.push({
          regexp: new RegExp(splits[1], splits[2]),
          type: value
        });
      });
    });

    callback();
  });
};

/**
 * Set up buttons.
 */
DrupalBookmarklet.prototype.setupButtons = function () {
  var $, bookmarklet, buttons;

  $ = this.jQuery;
  bookmarklet = this;

  buttons = {};

  // Make UI Dialog buttons for each content type.
  $.each(this.settings.types, function (machineName, setting) {
    buttons[setting.name] = function (event) {
      var params;
      params = {
        q: 'node/add/' + machineName,
        edit: bookmarklet.getPrepopulate(machineName)
      };
      $('iframe', this).attr('src', bookmarklet.iframeUrl(params));
    };
  });

  this.dialog.dialog('option', 'buttons', buttons);

  // private member: $(elem).data('dialog') returns jQuery UI dialog object.
  this.dialog.data('dialog').uiDialog
    // Create a button set to show that the options are related.
    .find('.ui-dialog-buttonpane')
    .buttonset()

    // Restyle the buttons to cancel any ui-dialog styles that interfere with
    // buttonset.
    .find('.ui-button')
    .each(function () {
      $(this).css({
        marginRight: 0,
        'float': 'none'
      });
    });
};

/**
 * Set up message channel.
 *
 * @see https://developer.mozilla.org/en/DOM/window.postMessage
 */
DrupalBookmarklet.prototype.setupMessageChannel = function () {
  var $, parsedUrl;

  $ = this.jQuery;
  parsedUrl = this.parseUrl(this.host);

  $.receiveMessage(
    $.proxy(this, 'handleMessage'),
    parsedUrl.scheme + ":" + parsedUrl.slash + parsedUrl.host +
      (parsedUrl.port ? ':' + parsedUrl.port : '')
  );
};

/**
 * receive postMessage events.
 *
 * The message handler is designed to pass most of the events as methods to the
 * ui.dialog widget.
 *
 * @param   event   object - must contain a method property,
 *                  if it contains an optionName property, it must contain a
 *                  value property.
 */
DrupalBookmarklet.prototype.handleMessage = function (event) {
  var $, data, bookmarklet, css;

  $ = this.jQuery;
  data = {};
  bookmarklet = this;

  $.each(decodeURIComponent(event.data).replace(/\+/g, " ").split("&"), function () {
    data[this.split("=")[0]] = this.split("=")[1];
  });

  // Messages are designed to be passed straight through to the jQuery UI
  // widget. If option name is undefined, the message is triggering a widget
  // method.
  if (typeof(data.optionName) === "undefined") {

    switch (data.method) {
    case 'close':
      setTimeout(function () {
        bookmarklet.dialog.dialog(data.method);
      }, 5000);
      break;

    case 'loadSettings':
      this.loadSettings(function () {
        bookmarklet.setupButtons();
      });
      break;

    default:
      this.dialog.dialog(data.method);
      break;
    }

  }
  else {
    switch (data.optionName) {

    // Height and width are put directly in the CSS of the dialog because
    // iframes are sensitive.
    case 'height':
    case 'width':
      css = {};
      css[data.optionName] = data.value;
      this.dialog.animate(css, 'fast', 'swing');
      break;

    default:
      this.dialog.dialog(data.method, data.optionName, data.value);
      break;
    }
  }

};

/**
 * Get the current text selection.
 *
 * @see http://betterexplained.com/articles/how-to-make-a-bookmarklet-for-your-web-application/
 */
DrupalBookmarklet.prototype.getSelection = function () {
  var t;

  try {
    // get the currently selected text
    t = ((window.getSelection && window.getSelection()) ||
      (document.getSelection && document.getSelection()) ||
      (document.selection && document.selection.createRange &&
      document.selection.createRange().text));
  }
  catch (e) {
    // access denied on https sites
    t = "";
  }

  t = t.toString();

  if (t === "") {
    t = "";
  }

  return t;
};

/**
 * @param   {String} href a URI
 * @returns {String} node type from map or default.
 */
DrupalBookmarklet.prototype.mapNodeType = function (href) {
  var $, nodeType;

  $ = this.jQuery;
  nodeType = this.settings.defaultType;

  $.each(this.settings.urlMap, function (index, pattern) {
    if (pattern.regexp.test(href)) {
      nodeType = pattern.type;
      return false;
    }
  });

  return nodeType;
};

/**
 * @param   {String} href a URI
 * @returns {Object} keys are URI parts
 *
 * @see From Chapter 7 of JavaScript, the Good Parts.
 */
DrupalBookmarklet.prototype.parseUrl = function (href) {
  var $, urlRegex, result, names, parsedUrl;

  $ = this.jQuery;
  urlRegex = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
  result = urlRegex.exec(href);
  names = ['url', 'scheme', 'slash', 'host', 'port', 'path', 'query', 'hash'];
  parsedUrl = {};

  $.each(names, function (item, name) {
    parsedUrl[name] = result[item];
  });

  return parsedUrl;
};

/**
 * @param {String} nodeType machine name of a node type.
 * @returns {Object} keys are FormAPI elements, will be sent through $.params().
 */
DrupalBookmarklet.prototype.getPrepopulate = function (nodeType) {
  var prepopulate, values, $, prepopulateMap;

  $ = this.jQuery;

  values = {
    title: document.title,
    href: location.href,
    selection: this.getSelection()
  };

  prepopulateMap = function (map) {
    var ret = {};

    $.each(map, function (key, value) {
      ret[key] = (typeof value === 'string') ? values[value] : prepopulateMap(value);
    });

    return ret;
  };

  // If the default node type isn't part of the allowed types in the settings
  // use a basic default map.
  prepopulate = this.settings.types.hasOwnProperty(nodeType) ?
    this.settings.types[nodeType].prepopulate : {
      title: 'title',
      body_field: { body: 'selection' }
    };

  return prepopulateMap(prepopulate);
};

/**
 * @param {String|Object} path string becomes the 'q' GET parameter.
 * @returns {String} absolute path
 */
DrupalBookmarklet.prototype.iframeUrl = function (path) {
  var $, params;

  $ = this.jQuery;
  params = {
    bookmarklet: true,
    origin: location.href
  };

  if (typeof path === "string") {
    $.extend(params, { q: path });
  }
  else if (typeof path === "object") {
    $.extend(params, path);
  }

  return this.host + '/?' + $.param(params) + this.settings.constant;
};

/**
 * Loads a stylesheet.
 *
 * @param {String} url
 */
DrupalBookmarklet.prototype.loadStylesheet = function (url) {
  var $;

  $ = this.jQuery;

  $('<link/>', {
      href: url,
      rel: 'stylesheet',
      type: 'text/css',
      media: 'screen'
    })
    .appendTo('head');
};

/**
 * Opens a new dialog and creates the iframe contents.
 *
 * @param {String} url from iframeUrl().
 */
DrupalBookmarklet.prototype.createBookmarklet = function (url) {
  var $, scrollHandler, timeout;

  $ = this.jQuery;

  this.dialog = $('<div/>', {
      id: 'drupal_bookmarklet',
      css: {
        overflow: 'visible'
      }
    })
    .append($('<iframe/>', {
      src: url,
      frameborder: 0,
      scrolling: 'no',
      name: 'drupal_bookmarklet_iframe',
      id: 'drupal_bookmarklet_iframe',
      width: '100%',
      height: '100%',
      css: {
        width: '100%',
        height: '100%',
        border: '0px',
        padding: '0px',
        margin: '0px'
      }
    }))
    .dialog({
      show: 'fade',
      hide: 'fade',
      position: ['right', 'top'],
      zIndex: 2147483647
    });

  // scrollHandler repositions dialog in the viewport after the user scrolls.
  scrollHandler = function (event) {
    var bookmarklet;

    bookmarklet = this;

    clearTimeout(timeout);
    timeout = setTimeout(function () {

      bookmarklet.dialog.data('dialog').uiDialog
        .clearQueue()
        .animate({
          marginTop: ($(window).scrollTop()) + 'px'
        }, 'fast', 'swing');

    }, 1000);
  };

  $(window).bind('scroll', $.proxy(scrollHandler, this));

  // private member: $(elem).data('dialog') returns jQuery UI dialog object.
  this.dialog.data('dialog').uiDialog

    // Shrink font size to a normal value.
    // jQuery UI stylesheets assumes base font size of 11px.
    .css({
      fontSize: '11px'
    });

};

/**
 * When the dialog has already been opened but the page isn't refreshed, this
 * function is called to reopen the dialog.
 */
DrupalBookmarklet.prototype.reOpen = function () {
  var $, nodeType, path;

  $ = this.jQuery;
  nodeType = this.mapNodeType(location.href);
  path = {
    q: 'node/add/' + nodeType,
    edit: this.getPrepopulate(nodeType)
  };

  // If the dialog has already been open, refresh the src URL of the iframe to
  // fill in the form with new values.
  $('iframe', this.dialog).attr('src', this.iframeUrl(path));

  if (!this.dialog.dialog('isOpen')) {
    this.dialog.dialog('open');
  }
};

/*jslint white: true, browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, strict: true, newcap: true, immed: true, indent: 2 */
