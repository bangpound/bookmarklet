<!-- $Id$ -->

Drupal Bookmarklet
==================

This module provides a bookmarklet to allow users to create new nodes while they browse other sites. The bookmarklet opens a jQuery UI Dialog containing an iframe of the Drupal node form.

[Video Demonstration](http://vimeo.com/11202911)  
![Screenshot](http://img.skitch.com/20100425-r5jkna852yjrxa9kftu7qxmhms.png "Drupal bookmarklet in action")

Usage
-----
This module implements `hook_block` to expose the link for users to drag to their browser's toolbars. The block configuration allows the site administrator to set the allowed and default content types available in the bookmarklet.

When [Embedded Media Field](http://drupal.org/project/emfield) or [Link](http://drupal.org/project/link) field are enabled, the bookmarklet will add the URL of the page where the bookmarklet was invoked to these fields. Furthermore, the bookmarklet will override the module's default content type when the user has invoked the bookmarklet script on a page whose URL matches a pattern returned in a provider's implementation of [`EMMODULE_PROVIDER_extract`](http://api.lullabot.com/EMMODULE_PROVIDER_extract).

Three alter hooks are invoked by this module with which developers can change the node form prepopulate pattern, the visibility of node form elements in the bookmarklet, and the URL - node type mappings.

* `hook_bookmarklet_fields_alter(&$preserve)`
* `hook_bookmarklet_prepopulate_pattern_alter(&$pattern, $type)`
* `hook_bookmarklet_urlmap_alter(&$map)`

Dependencies
------------
* [Prepopulate](http://drupal.org/project/prepopulate)  
  The module was developed with the 6.x-2.x branch, but the more stable branch probably works too.
* [jQuery postMessage](http://github.com/cowboy/jquery-postmessage/)  
  postMessage is what enables XSS between the parent and the child iframe on different domains. If the browser supports [window.postMessage](https://developer.mozilla.org/en/DOM/window.postMessage), this is used. Otherwise, the location of the parent page is updated with the message as the fragment. (Embedded as git submodule.)

Issues
------
1. This module needs a security review because of its reliance on cross site scripting. If you have skills in JavaScript security and are interested in this module, the maintainer would appreciate your feedback. **Do not use this module on a production site until the security implications are understood and documented.**
2. The bookmarklet UI and UX leverages default jQuery UI components and do not reflect a thoughtful implementation of any intentional design to make this project easy and pleasant to use. If you're interested in this module and have UI/UX design sense, please post issues with your concrete suggestions.
3. This module is not complete nor very configurable. It's only been tested in Firefox 3 and Safari.
4. The block configuration is the least obvious place to change settings for the bookmarklet.
5. Multiple invocations of the bookmarklet on the same page cause the dialog to reappear, but this is not always desirable.
6. There is no status indicators. Is the iframe loading? Is the node saving?
7. jQuery, jQuery UI and jQuery UI stylesheet are loaded from [Google](http://code.google.com/apis/ajaxlibs/documentation/index.html) and collide with existing jQuery UI styles in the current document.
8. Because this module implements `hook_form_alter`, this module's weight in the system table is important. For example, it must run after Vertical Tabs if you want to disable Vertical Tabs for bookmarklet forms.
9. The Drupal theme needs to be educated about how to render and style forms for the bookmarklet.
10. Warn the user when he has third party cookies disabled.

References
----------
* [How To Make a Bookmarklet For Your Web Application](http://betterexplained.com/articles/how-to-make-a-bookmarklet-for-your-web-application/)
* [jQuery UI Themeroller Bookmarklet](http://jqueryui.com/themeroller/developertool/developertool.js.php)

