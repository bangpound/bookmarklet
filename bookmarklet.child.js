Drupal.behaviors.bookmarkletPostMessage = function (context) {
  if (Drupal.settings.bookmarklet.event !== "undefined") {
    $.postMessage(Drupal.settings.bookmarklet.event, Drupal.settings.bookmarklet.target_url);
  }
};
