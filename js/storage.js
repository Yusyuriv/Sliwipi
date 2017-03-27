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
  /**
   * Same as <code>chrome.storage[area].get</code>, but with a promise instead of a callback
   * @param {string|string[]|object|object[]} keys
   * @returns {Promise}
   */
  function get(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage[this].get(keys, data => {
        resolve(data);
      });
    });
  }
  /**
   * Same as <code>chrome.storage[area].set</code>, but with a promise instead of a callback
   * @param {object|object[]} data
   * @returns {Promise}
   */
  function set(data) {
    return new Promise((resolve, reject) => {
      chrome.storage[this].set(data, () => {
        resolve();
      });
    });
  }
  window.storage = {
    get: get.bind('local'),
    set: set.bind('local'),
    sync: {
      get: get.bind('sync'),
      set: set.bind('sync')
    }
  };
})();