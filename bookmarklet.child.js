Drupal.bookmarklet = {};
Drupal.bookmarklet.sendParentFrameMsg = function (msg) {
  parent.location = Drupal.settings.bookmarklet.referrer + "#" + msg;
};
$(document).ready(function () {
  Drupal.bookmarklet.sendParentFrameMsg('close=1');
});
