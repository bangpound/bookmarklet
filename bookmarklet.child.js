/*global $, Drupal, document, setTimeout */

"use strict";

$(document).ready(function () {

  $.postMessage({
    method: 'option',
    optionName: 'height',
    value: document.body.offsetHeight
  }, Drupal.settings.bookmarklet.target_url);

  setTimeout(function () {
    $.postMessage({
      method: 'option',
      optionName: 'width',
      value: document.body.offsetWidth
    }, Drupal.settings.bookmarklet.target_url);
  }, 100);

});

Drupal.behaviors.bookmarkletPostMessage = function (context) {
  if (Drupal.settings.bookmarklet.event !== "undefined") {
    $.postMessage(Drupal.settings.bookmarklet.event, Drupal.settings.bookmarklet.target_url);
  }
};

/*jslint white: true, browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, indent: 2 */
