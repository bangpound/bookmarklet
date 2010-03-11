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

      // TODO: Get this in one match.
      drupalBookmarklet.createBookmarklet($);
      $.receiveMessage(
        drupalBookmarklet.handleMessage,
        // https://developer.mozilla.org/en/DOM/window.postMessage
        drupalBookmarklet.host.match(/(.*?:\/\/.*?)\//)
      );
    }(drupalBookmarklet.jQuery = jQuery.noConflict(true)));
  };
  document.getElementsByTagName('head')[0].appendChild(drupalBookmarklet.s1);
};

drupalBookmarklet.handleMessage = function (event) {
  if (event.data === 'close') {
    drupalBookmarklet.jQuery(drupalBookmarklet.dialog).dialog('close');
  }
  if (event.data === 'resize') {
    drupalBookmarklet.jQuery(drupalBookmarklet.dialog).dialog('option', {
      width: 'auto',
      height: 'auto'
    });
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

drupalBookmarklet.createBookmarklet = function ($) {
  var body, iframe_url;

  body = this.getSelection();

  iframe_url = drupalBookmarklet.host;
  iframe_url += '/node/add/link?bookmarklet';

  iframe_url += '&edit[field_link][0][url]=';
  iframe_url += encodeURIComponent(location.href);

  iframe_url += '&edit[field_link][0][title]=';
  iframe_url += encodeURIComponent(document.title);

  if (body !== "") {
    iframe_url += '&edit[body_field][body]=';
    iframe_url += encodeURIComponent(body);
  }

  $('<link/>', {
    href: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.7/themes/flick/jquery-ui.css',
    rel: 'stylesheet',
    type: 'text/css',
    media: 'screen'
  })
    .appendTo('head');

  this.dialog = this.dialog || $('<div/>', { id: 'drupal_bookmarklet' })
    .append($('<iframe/>', {
      src: iframe_url,
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
    .dialog();

  $(document).keypress(function (event) {
    if (event.keyCode === '27') {
      event.preventDefault();
      $('#drupal_bookmarklet').toggle();
    }
  });
};

(function () {
  if (typeof drupalBookmarklet.dialog === "undefined") {
    drupalBookmarklet.init();
  }
  else {
    // If the dialog has been closed, re-open.
    drupalBookmarklet.jQuery(drupalBookmarklet.dialog).dialog('open');
    // If the dialog is already open, check for selected text and refresh
    // the iframe. Probably less helpful than it sounds.
    // TODO.
  }
}());

/*jslint white: true, browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, indent: 2 */
