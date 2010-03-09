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

function keyPressHandler(e) {
  var kC, Esc;
  kC  = (window.event) ? event.keyCode : e.keyCode; // MSIE or Firefox?
  Esc = (window.event) ? 27 : e.DOM_VK_ESCAPE; // MSIE : Firefox
  if (kC === Esc) {
    // alert("Esc pressed");
    toggleItem("drupal_bookmarklet");
  }
}

function showItem(id) {
  try {
    var item;
    item = document.getElementById(id);
    if (item) {
      item.style.display = "";
    }
  }
  catch (e) {

  }
}

(function () {
  // get the currently selected text
  var t, body, iframe_url, existing_iframe, div, str;
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

  iframe_url = DRUPAL_BOOKMARKLET_HOST + '/node/add/link?=' + encodeURIComponent(location.href) + '&field_link[0][title]=' + encodeURIComponent(document.title);

  existing_iframe = document.getElementById('drupal_bookmarklet_iframe');

  if (existing_iframe) {
    showItem('drupal_bookmarklet');
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

  div = document.createElement("div");
  div.id = "drupal_bookmarklet";

  str = "";
  str += "<iframe frameborder='0' scrolling='no' name='drupal_bookmarklet_iframe' id='drupal_bookmarklet_iframe' src='" + iframe_url + "' style='textalign:right; backgroundColor: white;'></iframe>";
  str += "<a href='javascript:void(0);' style='width:100%; text-align: middle; color: #FF0000; font-family: Arial;'>x</a>";

  div.innerHTML = str;

  div.onkeypress = keyPressHandler;
  document.body.insertBefore(div, document.body.firstChild);
})();

/*jslint white: true, browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, indent: 2 */
