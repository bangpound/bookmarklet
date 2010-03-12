/*global drupalBookmarklet,window,jQuery */

"use strict";

drupalBookmarklet.init = function () {
  drupalBookmarklet.s1 = document.createElement('script');
  drupalBookmarklet.s2 = document.createElement('script');
  drupalBookmarklet.s3 = document.createElement('script');

  drupalBookmarklet.s1.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.js');
  drupalBookmarklet.s2.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.7/jquery-ui.js');
  drupalBookmarklet.s3.setAttribute('src', drupalBookmarklet.host + '/' + drupalBookmarklet.path + '/jquery-postmessage/jquery.ba-postmessage.js');

  drupalBookmarklet.s1.onload = function () {
    document.getElementsByTagName('head')[0].appendChild(drupalBookmarklet.s2);
  };
  drupalBookmarklet.s2.onload = function () {
    document.getElementsByTagName('head')[0].appendChild(drupalBookmarklet.s3);
  };
  drupalBookmarklet.s3.onload = function () {
    // newly loaded jQuery is attached to the drupalBookmarklet object as the
    // jQuery method.
    (function ($) {
      var buttons;
      buttons = {};

      $.getJSON(drupalBookmarklet.host + '/bookmarklet/js?callback=?', function (json) {

        $.each(json, function (machineName, nodeType) {
          buttons[nodeType] = function () {
            $('iframe', this).attr('src', drupalBookmarklet.iframeUrl(machineName));
          };
        });

        drupalBookmarklet.createBookmarklet(buttons);

        $.receiveMessage(
          drupalBookmarklet.handleMessage,
          // https://developer.mozilla.org/en/DOM/window.postMessage
          drupalBookmarklet.host.match(/(.*?:\/\/.*?)\//)
        );

      });
    }(drupalBookmarklet.jQuery = jQuery.noConflict(true)));
  };
  document.getElementsByTagName('head')[0].appendChild(drupalBookmarklet.s1);
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
  var body, iframe_url;

  body = this.getSelection();

  iframe_url = drupalBookmarklet.host;
  iframe_url += '/node/add/' + nodeType + '?bookmarklet';

  switch (nodeType) {
  case 'video':

    // Video URL
    iframe_url += '&edit[field_emvideo][0][embed]=';
    iframe_url += encodeURIComponent(location.href);
    break;
  case 'link':

    // Link URL
    iframe_url += '&edit[field_link][0][url]=';
    iframe_url += encodeURIComponent(location.href);

    // Link title
    iframe_url += '&edit[field_link][0][title]=';
    iframe_url += encodeURIComponent(document.title);
    break;
  default:

    // Node title
    iframe_url += '&edit[title]=';
    iframe_url += encodeURIComponent(document.title);
    break;
  }

  if (body !== "") {
    iframe_url += '&edit[body_field][body]=';
    iframe_url += encodeURIComponent(body);
  }

  return iframe_url;
};

drupalBookmarklet.createBookmarklet = function (buttons) {
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
      src: this.iframeUrl('story'),
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
    });

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
    drupalBookmarklet.jQuery('iframe', drupalBookmarklet.dialog).attr('src', drupalBookmarklet.iframeUrl('story'));
    drupalBookmarklet.jQuery(drupalBookmarklet.dialog).dialog('open');
  }
}());

/*jslint white: true, browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, indent: 2 */
