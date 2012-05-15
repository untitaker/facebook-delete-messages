// ==UserScript==
// @name        Facebook Delete Messages
// @author      Markus Unterwaditzer <markus@unterwaditzer.net> http://unterwaditzer.net
// @description Userscript for Facebook Messages to replace the archive button with a delete button. Based on http://userscripts.org/scripts/show/106261
// @version     0.1
// @namespace   fbdelmsg
// @include     http://*.facebook.com/*
// @include     https://*.facebook.com/*
// @require     http://code.jquery.com/jquery-1.3.2.min.js
//
// ==/UserScript==

// a function that loads jQuery and calls a callback function when jQuery has finished loading
function addJQuery(callback) {
  var script = document.createElement('script');
  script.setAttribute('src', 'https://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js');
  script.addEventListener('load', function() {
    var script = document.createElement('script');
    script.textContent = '(' + callback.toString() + ')();';
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
}


function switchDeleteButtons() {
  var q = jQuery;
  // Restore global $ variable for sanity.
  $.noConflict();
  var running = false;
  var run = function() {
   console.log('Running!');
    if (running || q('#MessagingDashboard').length == 0) {
      return;
    }
    running = true;
    try {
      if (q('#MessagingThreadlist').length == 0) {
        // Single view of messaging thread
        console.log('Detected single view');
        if (q('#QuickDelete').length == 0) {
          actions = q('#MessagingFrame').find('form.uiHeaderActions');
          tid = actions.find('input[name=tid]').first().attr('value');
          if (tid) {
            elem = q('<a class="uiButton uiButtonConfirm uiToolbarItem" id="QuickDelete" role="button" rel="dialog"><span class="uiButtonText">Delete All</span></a>');
            elem.attr('href','/ajax/messaging/async.php?action=deleteDialog&tid='+encodeURIComponent(tid));
            elem.attr('ajaxify','/ajax/messaging/async.php?action=deleteDialog&tid='+encodeURIComponent(tid));
            // console.log(elem, actions.find('div[class~='uiToolbarContent']'));
            elem.insertBefore(actions.find('div.uiToolbarContent').children().children().first());
          }
        }
      } else {
        // We are in the overview of all messages
        // Avoid false positives by class and structure matching. Better than URLs.
        console.log('Detected overview');
        q('li.threadRow a.archiveLink').each(function() {
          a = q(this);
          a.attr('ajaxify', a.attr('ajaxify').replace('action=tag&','action=delete&'));
          a.attr('title', 'Delete instantly');

          a.find('input').attr('value', 'D');
          l = a.find('label.uiCloseButton');
          if (l.attr('class')) {
            l.attr('class', 'uiCloseButton uiCloseButtonSmall uiDeleteButton');
          }
        });
      }
    }
    catch(e){ console.log('Exception:', e) };
    running = false;
  };

  run();
  jQuery(document).ready(run);
  jQuery(document).bind('DOMNodeInserted', run);
}

// load jQuery and execute the main function
addJQuery(switchDeleteButtons);
