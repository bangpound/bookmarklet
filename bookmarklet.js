"use strict";
/*global window,document,event,location,DRUPAL_BOOKMARKLET_HOST */

function toggleItem(id) {
  var item;
  item = document.getElementById(id);
  if (item) {
    if (item.style.display === "none") {
      item.style.display = "";
    }
    else {
      item.style.display = "none";
    }
  }
}

function drupalBookmarklet($, L) {
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

  iframe_url = DRUPAL_BOOKMARKLET_HOST;
  iframe_url += '/node/add/link?edit[field_link][0][url]=';
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

  // alert("hi there: [" + body + "]");
  //addCSS("http://instacalc.com/gadget/styles/instacalc.bookmarklet.mini.css");

  // wrapper
  $('<div id="drupal_bookmarklet"/>')
    .css({
      position: 'absolute',
      right: '0px',
      zIndex: 10000,
      margin: '10px',
      top: '0px'
    })
    .prependTo('body')

    // inner
    .append('<div/>')
    .children('div')
    .css({
      backgroundColor: 'white',
      zIndex: 2,
      width: '500px',
      height: '355px',
      border: 'solid rgb(180,180,180)',
      borderWidth: '6px'
    })

    // iframe
    .append('<iframe/>')
    .children('iframe')
    .attr({
      src: iframe_url,
      frameborder: 0,
      scrolling: 'yes',
      name: 'drupal_bookmarklet_iframe',
      id: 'drupal_bookmarklet_iframe'
    })
    .css({
      width: '100%',
      height: '100%',
      border: '1px',
      padding: '0px',
      margin: '0px'
    })

    // close button
    .parent('<div/>')
    .append('<a/>')
    .children('a')
    .css({
      width: '100%',
      color: '#ff0000'
    })
    .click(function () {
      $('#drupal_bookmarklet').remove();
    })
    .text('x');

  $(document).keypress(function (event) {
    if (event.keyCode == '27') {
      event.preventDefault();
      $('#drupal_bookmarklet').toggle();
    }
  });

}

/*jslint white: true, browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, indent: 2 */
