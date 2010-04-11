/*global window,jQuery */

"use strict";

var DrupalBookmarklet;

/**
 * @constructor
 */
DrupalBookmarklet = function (host, path) {
  this.host = host;
  this.path = path;
  this.init();
};

DrupalBookmarklet.prototype.createScript = function (src, callback) {
  var script;
  script = document.createElement('script');
  script.setAttribute('src', src);
  if (callback) {
    script.onload = callback;
  }
  return script;
};

DrupalBookmarklet.prototype.init = function () {
  var bookmarklet;
  bookmarklet = this;

  this.s1 = this.createScript('http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.js', function () {
    document.getElementsByTagName('head')[0].appendChild(bookmarklet.s2);
  });

  this.s2 = this.createScript('http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/jquery-ui.js', function () {
    document.getElementsByTagName('head')[0].appendChild(bookmarklet.s3);
  });

  this.s3 = this.createScript(this.host + '/' + this.path + '/jquery-postmessage/jquery.ba-postmessage.js', function () {
    // newly loaded jQuery is attached to the bookmarklet object as the
    // jQuery method.
    (function ($) {
      bookmarklet.setupMessageChannel();

      // Pull bookmarklet settings from Drupal callback.
      bookmarklet.loadSettings(function (json) {
        var nodeType, params, url;

        nodeType = bookmarklet.mapNodeType(location.href);
        params = {
          edit: bookmarklet.getPrepopulate(nodeType)
        };

        if (json.authenticated === false && json.types.length === 0) {
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
        bookmarklet.createBookmarklet(url);

      });
    }(bookmarklet.jQuery = jQuery.noConflict(true)));
  });

  document.getElementsByTagName('head')[0].appendChild(this.s1);
};

/**
 * Load bookmarklet settings.
 */
DrupalBookmarklet.prototype.loadSettings = function (callback) {
  var bookmarklet, $, url;

  bookmarklet = this;
  $ = this.jQuery;
  url = this.host + '?' + $.param({ q: 'bookmarklet/js' }) + '&callback=?';

  $.getJSON(url, function (json) {
    bookmarklet.settings = json;
    callback(json);
  });
};

/**
 * Set up buttons.
 */
DrupalBookmarklet.prototype.setupButtons = function () {
  var $, bookmarklet;

  $ = this.jQuery;
  bookmarklet = this;

  this.buttons = {};

  // Make UI Dialog buttons for each content type.
  $.each(this.settings.types, function (machineName, setting) {
    bookmarklet.buttons[setting.name] = function (event) {
      var params;
      params = {
        q: 'node/add/' + machineName,
        edit: bookmarklet.getPrepopulate(machineName)
      };
      $('iframe', this).attr('src', bookmarklet.iframeUrl(params));
    };
  });
};

/**
 * Set up message channel.
 */
DrupalBookmarklet.prototype.setupMessageChannel = function () {
  var $, parsedUrl;

  $ = this.jQuery;
  parsedUrl = this.parseUrl(this.host);

  $.receiveMessage(
    $.proxy(this, 'handleMessage'),
    // https://developer.mozilla.org/en/DOM/window.postMessage
    parsedUrl.scheme + ":" + parsedUrl.slash + parsedUrl.host + (parsedUrl.port ? ':' + parsedUrl.port : '')
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
  var $, data, bookmarklet;
  $ = this.jQuery;
  data = {};
  bookmarklet = this;
  $.each(decodeURIComponent(event.data).replace(/\+/g, " ").split("&"), function () {
    data[this.split("=")[0]] = this.split("=")[1];
  });
  if (typeof(data.optionName) === "undefined") {
    if (data.method === 'close') {
      setTimeout(function () {
        bookmarklet.jQuery(bookmarklet.dialog).dialog(data.method);
      }, 5000);
    }
    else {
      $(this.dialog).dialog(data.method);
    }
  }
  else {
    switch (data.optionName) {
    case 'height':
    case 'width':
      this.dialog.css(data.optionName, data.value + "px");
      break;
    default:
      $(this.dialog).dialog(data.method, data.optionName, data.value);
      break;
    }
  }
};

DrupalBookmarklet.prototype.getSelection = function () {
  var t;

  try {
    // get the currently selected text
    t = ((window.getSelection && window.getSelection()) || (document.getSelection && document.getSelection()) || (document.selection && document.selection.createRange && document.selection.createRange().text));
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

DrupalBookmarklet.prototype.mapNodeType = function (href) {
  return this.settings.urlMap[this.parseUrl(href).host] || this.settings.defaultType;
};

// From Chapter 7 of JavaScript, the Good Parts.

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

DrupalBookmarklet.prototype.getPrepopulate = function (nodeType) {
  var edit, selection;

  edit = {};
  selection = this.getSelection();

  switch (nodeType) {
  case 'video':

    // Video URL
    edit.field_emvideo = [{
      embed: location.href
    }];
    break;
  case 'link':

    // Link URL & title
    edit.field_link = [{
      url: location.href,
      title: document.title
    }];
    break;
  default:

    // Node title
    edit.title = document.title;
    break;
  }

  if (selection !== "") {
    edit.body_field = {
      body: selection
    };
  }

  return edit;
};

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

  return this.host + '?' + $.param(params) + this.settings.constant;
};

DrupalBookmarklet.prototype.createBookmarklet = function (url) {
  var $;

  $ = this.jQuery;

  $('<link/>', {
      href: this.settings.stylesheet,
      rel: 'stylesheet',
      type: 'text/css',
      media: 'screen'
    })
    .appendTo('head');

  this.setupButtons();

  this.dialog = this.dialog || $('<div/>', {
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
      position: ['right', 'top'],
      buttons: this.buttons,
      zIndex: 2147483647
    });

  // private member: $(elem).data('dialog') returns jQuery UI dialog object.
  this.dialog.data('dialog').uiDialog

    // Shrink font size to a normal value.
    // jQuery UI stylesheets assumes base font size of 11px.
    .css({
      fontSize: '11px'
    })

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
  if (!$(this.dialog).dialog('isOpen')) {
    $(this.dialog).dialog('open');
  }
};

window['DrupalBookmarklet'] = DrupalBookmarklet;
DrupalBookmarklet.prototype['init'] = DrupalBookmarklet.prototype.init;
DrupalBookmarklet.prototype['handleMessage'] = DrupalBookmarklet.prototype.handleMessage;
DrupalBookmarklet.prototype['getSelection'] = DrupalBookmarklet.prototype.getSelection;
DrupalBookmarklet.prototype['iframeUrl'] = DrupalBookmarklet.prototype.iframeUrl;
DrupalBookmarklet.prototype['createBookmarklet'] = DrupalBookmarklet.prototype.createBookmarklet;
DrupalBookmarklet.prototype['reOpen'] = DrupalBookmarklet.prototype.reOpen;

/*jslint white: true, browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, strict: true, newcap: true, immed: true, indent: 2 */
