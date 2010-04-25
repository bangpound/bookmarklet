<!-- $Id$ -->

Drupal Bookmarklet
==================

This module provides a bookmarklet to allow users to create new nodes while they browse other sites. The bookmarklet opens a jQuery UI Dialog containing an iframe of the Drupal node form.

[Video Demonstration](http://vimeo.com/11202911)  
![Screenshot](http://img.skitch.com/20100425-r5jkna852yjrxa9kftu7qxmhms.png "Drupal bookmarklet in action")

Dependencies
------------
* [Prepopulate](http://drupal.org/project/prepopulate)  
  The module was developed with the 6.x-2.x branch, but the more stable branch probably works too.
* [jQuery postMessage](http://github.com/cowboy/jquery-postmessage/)  
  postMessage is what enables XSS between the parent and the child iframe on different domains. If the browser supports [window.postMessage](https://developer.mozilla.org/en/DOM/window.postMessage), this is used. Otherwise, the location of the parent page is updated with the message as the fragment. (Embedded as git submodule.)

Issues
------
This module is not complete nor very configurable. It's only been tested in Firefox 3 and Safari.

Multiple invocations of the bookmarklet on the same page cause the dialog to reappear, but this is not always desirable.

There is no status indicators. Is the iframe loading? Is the node saving?

jQuery, jQuery UI and jQuery UI stylesheet are loaded from [Google](http://code.google.com/apis/ajaxlibs/documentation/index.html).

Because this module implements hook\_form\_alter, this module's weight in the system table is important. For example, it must run after Vertical Tabs if you want to disable Vertical Tabs for bookmarklet forms.

Road map
--------
The Drupal theme needs to be educated about how to render and style forms for the bookmarklet.

Warn the user when he has third party cookies disabled.

References
----------
* [How To Make a Bookmarklet For Your Web Application](http://betterexplained.com/articles/how-to-make-a-bookmarklet-for-your-web-application/)
* [jQuery UI Themeroller Bookmarklet](http://jqueryui.com/themeroller/developertool/developertool.js.php)

