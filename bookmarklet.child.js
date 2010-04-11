/*global $, Drupal, document, setTimeout */

"use strict";

$(document).ready(function () {

  $.postMessage({
    method: 'option',
    optionName: 'title',
    value: $('title').html()
  }, Drupal.settings.bookmarklet.target_url);

  setTimeout(function () {
    $.postMessage({
      method: 'option',
      optionName: 'height',
      value: document.body.offsetHeight
    }, Drupal.settings.bookmarklet.target_url);
  }, 100);

  setTimeout(function () {
    $.postMessage({
      method: 'option',
      optionName: 'width',
      value: document.body.offsetWidth
    }, Drupal.settings.bookmarklet.target_url);
  }, 100);

});

Drupal.behaviors.bookmarkletPostMessage = function (context) {
  if (Drupal.settings.bookmarklet.hasOwnProperty('events')) {
    $.each(Drupal.settings.bookmarklet.events, function (index, value) {
      $.postMessage(value, Drupal.settings.bookmarklet.target_url);
    });
  }
};

/*jslint white: true, browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, indent: 2 */
