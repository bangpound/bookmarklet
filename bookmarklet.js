// Inspired by:
// http://jqueryui.com/themeroller/developertool/developertool.js.php

"use strict";

/*global drupalBookmarklet,window,jQuery */

drupalBookmarklet.s1 = document.createElement('script');
drupalBookmarklet.s2 = document.createElement('script');
drupalBookmarklet.s1.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.js');
drupalBookmarklet.s2.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.7/jquery-ui.js');
document.getElementsByTagName('head')[0].appendChild(drupalBookmarklet.s1);
document.getElementsByTagName('head')[0].appendChild(drupalBookmarklet.s2);
//once jq and ui are loaded...
drupalBookmarklet.s1.onload = function () {
  drupalBookmarklet.s2.onload = function () {
    (function ($) {
      $('<link/>')
        .attr({
          href: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.7/themes/flick/jquery-ui.css',
          rel: 'stylesheet',
          type: 'text/css',
          media: 'screen'
        })
        .appendTo('head');

      // get the currently selected text
      var t, body, iframe_url, existing_iframe;
      try {
        t = ((window.getSelection && window.getSelection()) || (document.getSelection && document.getSelection()) || (document.selection && document.selection.createRange && document.selection.createRange().text));
      }
      catch (e) { // access denied on https sites
        t = "";
      }

      body = t.toString();

      if (body === "") {
        body = "";
      }

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

      existing_iframe = $('#drupal_bookmarklet_iframe')[0];

      if (existing_iframe) {
        $('#drupal_bookmarklet').show();
        // if has text selected, copy into iframe
        if (body !== "") {
          existing_iframe.src = iframe_url;
        }
        else {
          // want to set focus back to that item! but can't; access denied
        }
        return;
      }

      $('<iframe/>')
        .attr({
          src: iframe_url,
          frameborder: 0,
          scrolling: 'no',
          name: 'drupal_bookmarklet_iframe',
          id: 'drupal_bookmarklet_iframe'
        })
        .dialog({
          position: ['right', 'top'],
          title: 'post to EI'
        })
        .css({
          width: '100%',
          height: '100%',
          border: '1px',
          padding: '0px',
          margin: '0px'
        });

      $(document).keypress(function (event) {
        if (event.keyCode === '27') {
          event.preventDefault();
          $('#drupal_bookmarklet').toggle();
        }
      });
    }(jQuery.noConflict(true)));
  };
};

/*jslint white: true, browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, indent: 2 */
