// ==UserScript==
// @name        Facebook Delete Messages
// @description Userscript for Facebook Messages to replace the archive button with a delete button. Based on http://userscripts.org/scripts/show/106261
// @updateURL   https://github.com/untitaker/facebook-delete-messages/raw/master/fbdelmsg.user.js
// @downloadURL https://github.com/untitaker/facebook-delete-messages/raw/master/fbdelmsg.user.js
// @version     0.3
// @namespace   fbdelmsg
// @include     http://*.facebook.com/*
// @include     https://*.facebook.com/*
// ==/UserScript==

// Inject code from a function into the site
function dump_script(some_script) {
  script = document.createElement('script');
  script.textContent = '(' + some_script.toString() + ')();';
  document.body.appendChild(script);
}


function core_script() {

  /*
   * A debug function.
   * */
  var debug = function(msg, lvl) {
    prefix = 'FB Delete Messages: ';
    if(lvl && lvl == 'error') {
      console.log(prefix+msg);
    } else {
      // console.log(prefix+msg);
    }
  }

  /*
   * Adds all event listeners
   * */
  var listen = function() {

    /*
     * Variable determines if replace_buttons is running.
     * */
    var running = false;

    /*
     * Helper function for loops
     * */
    var foreach = function(list, callback) {
      var i, len;
      
      if(len > 0) {
        for(i=0, len=list.length; i<len; i++) {
          callback(list[i]);
        }
      }
    }

    /*
     * Does the main job; replaces all site buttons with the superior ones.
     * Gets executed multiple times per pageload, for example after
     * Facebook's javascript changed something.
     * */
    var replace_buttons = function() {
      var actions, toolbar_button, first_toolbar_button, tid;
      if (running || !document.getElementById('MessagingDashboard')) {
        return;
      }
      running = true;
      if (!document.getElementById('MessagingThreadlist')) {
        // Single view of messaging thread
        debug('Detected single view');
        if (!document.getElementById('QuickDelete')) {
          actions = document.getElementById('MessagingFrame').getElementsByClassName('uiHeaderActions');
          tid = document.getElementsByName('tid');
          if (tid.length > 0) {
            tid = tid[0].value;
            toolbar_button = document.createElement('a');
            toolbar_button.className = 'uiButton uiButtonConfirm uiToolbarItem';
            toolbar_button.setAttribute('id', 'QuickDelete');
            toolbar_button.setAttribute('role', 'button');
            toolbar_button.setAttribute('rel', 'dialog');
            toolbar_button.setAttribute('title', 'Delete this conversation');
            toolbar_button.setAttribute('href', '/ajax/messaging/async.php?action=deleteDialog&tid='+encodeURIComponent(tid));
            toolbar_button.setAttribute('ajaxify', toolbar_button.getAttribute('href'));

            toolbar_button.innerHTML = '<span class="uiButtonText">Delete</span>';
            first_toolbar_button = document.getElementsByClassName('uiToolbarItem')[0];
            first_toolbar_button.parentNode.insertBefore(toolbar_button, first_toolbar_button.nextSibling);
          }
        }
      } else {
        // We are in the overview of all messages
        // Avoid false positives by class and structure matching. Better than URLs.
        debug('Detected overview');
        if(document.getElementsByClassName('deleteLink').length == 0) {
          var deal_with_them = function(a_orig) {
            var a, l;
            
            a = a_orig.cloneNode(true); // Make a deep copy. This will clone the original button
            a.setAttribute('ajaxify', a.getAttribute('ajaxify').replace('action=tag&','action=delete&'));
            a.setAttribute('title', 'Delete this conversation');
            a.className += ' deleteLink archiveLink';
            a.className = a.className.replace('unarchiveLink', ''); // deleteLink for reference, the rest for styling
            a.style.display = 'block'; // Facebook removes archiveLinks with CSS in archive view

            foreach(a.getElementsByTagName('input'), function(element) {
              element.value = 'D';
            });

            l = a.getElementsByClassName('uiCloseButton')[0];
            if (l.className) {
              l.className = 'uiCloseButton uiCloseButtonSmall uiDeleteButton';
            }

            a_orig.parentNode.insertBefore(a, a_orig.nextSibling);

            if((' '+a_orig.className+' ').replace(' archiveLink ', '') != (' '+a_orig.className+' ')) {
              // hasClass('archiveLink')
              a_orig.parentNode.removeChild(a_orig);
              // It is confusing if two buttons have the same icon, so we remove the original button
            }
          }

          // handle the unarchive links before the archive links, otherwise the
          // already processed unarchive links will get an archive link class
          // (for style) and will be processed again.
          foreach(document.getElementsByClassName('archiveLink'), deal_with_them);
          foreach(document.getElementsByClassName('unarchiveLink'), deal_with_them);
        }

        // Add "Delete All" button on top
        if(!document.getElementById('QuickDelete')) {          
          toolbar_button = document.createElement('a');
          toolbar_button.className = 'uiButton uiButtonConfirm uiToolbarItem';
          toolbar_button.setAttribute('id', 'QuickDelete');
          toolbar_button.setAttribute('role', 'button');
          toolbar_button.setAttribute('title', 'Delete all conversations');
          toolbar_button.setAttribute('href', '#');
          toolbar_button.innerHTML = '<span class="uiButtonText">Delete all</span>';

          toolbar_button.addEventListener('click', function(){
            if(confirm('Do you want to delete all your messages?')) {
              foreach(document.getElementsByClassName('deleteLink'), function(link){
                link.click();
              });
            }
          });
          first_toolbar_button = document.getElementsByClassName('uiToolbarItem')[0];
          first_toolbar_button.parentNode.insertBefore(toolbar_button, first_toolbar_button.nextSibling);

        }
      }
      running = false;
    };

    document.addEventListener('DOMNodeInserted', replace_buttons);
  }

  // add event handlers
  listen();
}

// dump the script in the DOM
dump_script(core_script);
