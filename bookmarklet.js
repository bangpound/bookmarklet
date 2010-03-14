/*global drupalBookmarklet,window,jQuery */

"use strict";

drupalBookmarklet.init = function () {
  var bookmarklet;
  bookmarklet = this;
  this.s1 = document.createElement('script');
  this.s2 = document.createElement('script');
  this.s3 = document.createElement('script');

  this.s1.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.js');
  this.s2.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.7/jquery-ui.js');
  this.s3.setAttribute('src', this.host + '/' + this.path + '/jquery-postmessage/jquery.ba-postmessage.js');

  this.s1.onload = function () {
    document.getElementsByTagName('head')[0].appendChild(bookmarklet.s2);
  };
  this.s2.onload = function () {
    document.getElementsByTagName('head')[0].appendChild(bookmarklet.s3);
  };
  this.s3.onload = function () {
    // newly loaded jQuery is attached to the drupalBookmarklet object as the
    // jQuery method.
    (function ($) {
      var buttons,nodeTypes;
      buttons = {};
      nodeTypes = [];

      $.getJSON(drupalBookmarklet.host + '/bookmarklet/js?callback=?', function (json) {

        $.each(json, function (machineName, nodeType) {
          nodeTypes.push(machineName);
          buttons[nodeType] = function () {
            $('iframe', this).attr('src', drupalBookmarklet.iframeUrl(machineName));
          };
        });

        drupalBookmarklet.createBookmarklet(buttons, nodeTypes[0]);

        $.receiveMessage(
          drupalBookmarklet.handleMessage,
          // https://developer.mozilla.org/en/DOM/window.postMessage
          drupalBookmarklet.host.match(/(.*?:\/\/.*?)\//)
        );

      });
    }(drupalBookmarklet.jQuery = jQuery.noConflict(true)));
  };
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
drupalBookmarklet.handleMessage = function (event) {
  var data;
  data = {};
  drupalBookmarklet.jQuery.each(decodeURIComponent(event.data).split("&"), function () {
    data[this.split("=")[0]] = this.split("=")[1];
  });
  if (typeof(data.optionName) === "undefined") {
    drupalBookmarklet.jQuery(drupalBookmarklet.dialog).dialog(data.method);
  }
  else {
    switch (data.optionName) {
    case 'height':
    case 'width':
      drupalBookmarklet.dialog.css(data.optionName, data.value + "px");
      break;
    default:
      drupalBookmarklet.jQuery(drupalBookmarklet.dialog).dialog(data.method, data.optionName, data.value);
      break;
    }
  }
};

drupalBookmarklet.getSelection = function () {
  var t, body;

  try {
    // get the currently selected text
    t = ((window.getSelection && window.getSelection()) || (document.getSelection && document.getSelection()) || (document.selection && document.selection.createRange && document.selection.createRange().text));
  }
  catch (e) {
    // access denied on https sites
    t = "";
  }

  body = t.toString();

  if (body === "") {
    body = "";
  }

  return body;
};

drupalBookmarklet.iframeUrl = function (nodeType) {
  var body, iframe_url, edit;

  edit = {};
  body = this.getSelection();

  iframe_url = drupalBookmarklet.host;
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

  return iframe_url + '?' + drupalBookmarklet.jQuery.param({ bookmarklet: true, edit: edit });
};

drupalBookmarklet.createBookmarklet = function (buttons, nodeType) {
  this.jQuery('<link/>', {
      href: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.7/themes/smoothness/jquery-ui.css',
      rel: 'stylesheet',
      type: 'text/css',
      media: 'screen'
    })
    .appendTo('head');

  this.dialog = this.dialog || this.jQuery('<div/>', {
      id: 'drupal_bookmarklet',
      css: {
        overflow: 'visible',
        padding: '0px'
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
      buttons: buttons
    })
    .data('defaultNodeType', nodeType);

  // jQuery UI stylesheets assumes base font size of 11px.
  this.dialog.data('dialog').uiDialog.css({
    fontSize: '11px'
  });
};

(function () {
  if (typeof drupalBookmarklet.dialog === "undefined") {
    drupalBookmarklet.init();
  }
  else {
    // If the dialog has already been open, refresh the src URL of the iframe to
    // fill in the form with new values.
    drupalBookmarklet.jQuery('iframe', drupalBookmarklet.dialog).attr('src', drupalBookmarklet.iframeUrl(drupalBookmarklet.dialog.data('defaultNodeType')));
    drupalBookmarklet.jQuery(drupalBookmarklet.dialog).dialog('open');
  }
}());

/*jslint white: true, browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, indent: 2 */
