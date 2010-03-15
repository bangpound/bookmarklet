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
