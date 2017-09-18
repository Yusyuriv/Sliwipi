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
   * @returns object
   */
  function parse() {
    let str = location.search;
    if(!str) return {};
    str = str.substr(1);
    if(!str) return {};
    let params = {};
    str.split('&').forEach(v => {
      v = v.split('=', 2);
      params[v[0]] = v[1];
    });
    return params;
  }
  (window.SLIWIPI || window).parseQueryParams = parse;
})();