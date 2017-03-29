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
(function() {
  let hash = location.hash.substr(1);
  let enabled = hash === 'library=true';

  history.replaceState({}, document.title, location.href.replace(location.hash, ''));

  // if library part is disabled in options, don't continue further
  if(!enabled) {
    return;
  }
  // a script element to be injected into the page to replace the original
  // BuildGameRow function so it doesn't slow down the browser on large lists
  let s = document.createElement('script');
  s.src = chrome.extension.getURL('/js/BuildGameRow-injectable.js');
  document.documentElement.appendChild(s);
  s.parentNode.removeChild(s);
})();