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
  // A script that will be inserted into the page to get access to variables in its context.
  // Then it will be able to send those variables to the extension using a custom event.
  let script = document.createElement('script');
  script.innerHTML = `
document.addEventListener('GameListPerformanceFix:Request', e => {
  var result;
  if(typeof e.detail === 'object') {
    result = {};
    for(let key of e.detail) {
      result[key] = window[key];
    }
  } else {
    result = window[e.detail];
  }
  var event = new CustomEvent('GameListPerformanceFix:Response', { detail: result });
  document.dispatchEvent(event);
});
`;
  function appendChild() {
    document.documentElement.appendChild(script);
    script.parentNode.removeChild(script);
  }
  /*if(document.head)
    appendChild();
  else
    document.addEventListener('DOMContentLoaded', appendChild);*/
  appendChild();
  let cb, resolve;

  /**
   * Passes the list of required variables to the injected script in the page context.
   * @param {string|string[]} variables
   * @param {function} callback
   */
  function get(variables, callback) {
    let event = new CustomEvent('GameListPerformanceFix:Request', { detail: variables });
    cb = callback;
    document.dispatchEvent(event);
  }
  /** Same as {@link get|get}, but instead of requiring a callback, it returns a promise. */
  get.promise = function(variables) {
    return new Promise((res, rej) => {
      resolve = res;
      get(variables, null);
    });
  };
  /** Event listener for when the injected script sends a response containing the requested variables **/
  document.addEventListener('GameListPerformanceFix:Response', e => {
    if(resolve) {
      resolve(e.detail);
      resolve = null;
    } else if(cb) {
      cb(e.detail);
    }
  });
  window.get = get;
})();