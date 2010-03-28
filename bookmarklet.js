/*global window,jQuery */

"use strict";

var drupalBookmarklet;

/**
 * @constructor
 */
drupalBookmarklet = function (host, path) {
  this.host = host;
  this.path = path;
  this.init();
};

drupalBookmarklet.prototype.createScript = function (src, callback) {
  var script;
  script = document.createElement('script');
  script.setAttribute('src', src);
  if (callback) {
    script.onload = callback;
  }
  return script;
};

drupalBookmarklet.prototype.init = function () {
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
      var buttons, nodeTypes;
      buttons = {};
      nodeTypes = [];

      // Pull bookmarklet settings from Drupal callback.
      $.getJSON(bookmarklet.host + '/bookmarklet/js?callback=?', function (json) {
        bookmarklet.settings = json;

        // Make UI Dialog buttons for each content type.
        $.each(json.types, function (machineName, setting) {
          nodeTypes.push(machineName);
          buttons[setting.name] = function (event) {
            $('iframe', this).attr('src', bookmarklet.iframeUrl(machineName));
            $(this).dialog('option', 'title', 'Post new ' + bookmarklet.settings.types[machineName].name);
          };
        });

        bookmarklet.createBookmarklet(buttons, nodeTypes[0]);

        $.receiveMessage(
          $.proxy(bookmarklet, 'handleMessage'),
          // https://developer.mozilla.org/en/DOM/window.postMessage
          bookmarklet.host.match(/(.*?:\/\/.*?)\//)
        );

      });
    }(bookmarklet.jQuery = jQuery.noConflict(true)));
  });

  document.getElementsByTagName('head')[0].appendChild(this.s1);
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
drupalBookmarklet.prototype.handleMessage = function (event) {
  var data, bookmarklet;
  data = {};
  bookmarklet = this;
  this.jQuery.each(decodeURIComponent(event.data).split("&"), function () {
    data[this.split("=")[0]] = this.split("=")[1];
  });
  if (typeof(data.optionName) === "undefined") {
    if (data.method === 'close') {
      setTimeout(function () {
        bookmarklet.jQuery(bookmarklet.dialog).dialog(data.method);
      }, 5000);
    }
    else {
      this.jQuery(this.dialog).dialog(data.method);
    }
  }
  else {
    switch (data.optionName) {
    case 'height':
    case 'width':
      this.dialog.css(data.optionName, data.value + "px");
      break;
    default:
      this.jQuery(this.dialog).dialog(data.method, data.optionName, data.value);
      break;
    }
  }
};

drupalBookmarklet.prototype.getSelection = function () {
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

drupalBookmarklet.prototype.iframeUrl = function (nodeType) {
  var body, iframe_url, edit;

  edit = {};
  body = this.getSelection();

  iframe_url = this.host;
  iframe_url += '/node/add/' + nodeType;

  switch (nodeType) {
  case 'video':

    // Video URL
    edit.field_emvideo = [];
    edit.field_emvideo[0] = {
      embed: location.href
    };
    break;
  case 'link':

    // Link URL & title
    edit.field_link = [];
    edit.field_link[0] = {
      url: location.href,
      title: document.title
    };
    break;
  default:

    // Node title
    edit.title = document.title;
    break;
  }

  if (body !== "") {
    edit.body_field = {
      body: body
    };
  }

  return iframe_url + '?' + this.jQuery.param({ bookmarklet: true, edit: edit }) + this.settings.constant;
};

drupalBookmarklet.prototype.createBookmarklet = function (buttons, nodeType) {
  this.jQuery('<link/>', {
      href: this.settings.stylesheet,
      rel: 'stylesheet',
      type: 'text/css',
      media: 'screen'
    })
    .appendTo('head');

  this.dialog = this.dialog || this.jQuery('<div/>', {
      id: 'drupal_bookmarklet',
      css: {
        overflow: 'visible'
      }
    })
    .append(this.jQuery('<iframe/>', {
      src: this.iframeUrl(nodeType),
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
      buttons: buttons,
      zIndex: 2147483647,
      title: 'Post new ' + this.settings.types[nodeType].name
    })
    .data('defaultNodeType', nodeType);

  // jQuery UI stylesheets assumes base font size of 11px.
  this.dialog.data('dialog').uiDialog.css({
    fontSize: '11px'
  });
};

drupalBookmarklet.prototype.reOpen = function () {
  // If the dialog has already been open, refresh the src URL of the iframe to
  // fill in the form with new values.
  this.jQuery('iframe', this.dialog).attr('src', this.iframeUrl(this.dialog.data('defaultNodeType')));
  if (!this.jQuery(this.dialog).dialog('isOpen')) {
    this.jQuery(this.dialog).dialog('open');
  }
};

window['drupalBookmarklet'] = drupalBookmarklet;
drupalBookmarklet.prototype['init'] = drupalBookmarklet.prototype.init;
drupalBookmarklet.prototype['handleMessage'] = drupalBookmarklet.prototype.handleMessage;
drupalBookmarklet.prototype['getSelection'] = drupalBookmarklet.prototype.getSelection;
drupalBookmarklet.prototype['iframeUrl'] = drupalBookmarklet.prototype.iframeUrl;
drupalBookmarklet.prototype['createBookmarklet'] = drupalBookmarklet.prototype.createBookmarklet;
drupalBookmarklet.prototype['reOpen'] = drupalBookmarklet.prototype.reOpen;

/*jslint white: true, browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, strict: true, newcap: true, immed: true, indent: 2 */
