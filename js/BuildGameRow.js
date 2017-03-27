/*
 Copyright 2017 Yan Li

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
(async function() {
  let libraryPerformance = await storage.sync.get({
    library: {
      enabled: true,
      perPage: 15
    }
  });
  // if library part is disabled in options, don't continue further
  if(!libraryPerformance.library.enabled) {
    return;
  }
  // a script element to be injected into the page to replace the original
  // BuildGameRow function so it doesn't slow down the browser on large lists
  let s = document.createElement('script');
  s.src = chrome.extension.getURL('/js/BuildGameRow-injectable.js');

  // an observer that injects the script above into the page as soon
  // as `head` tag is already in the page
  let observer = new MutationObserver(async function (mutations) {
    for (let i = 0; i < mutations.length; i++) {
      let mutation = mutations[i];
      let addedNode = mutation.addedNodes[0];
      if (addedNode && addedNode.tagName === 'BODY') {
        observer.disconnect();

        document.head.appendChild(s);
        s.parentNode.removeChild(s);
        return;
      }
    }
  });
  observer.observe(document.documentElement, {childList: true, attributes: false, subtree: false});
})();