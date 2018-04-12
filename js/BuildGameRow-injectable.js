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
  Object.defineProperty(window, 'rgGames', {
    configurable: true,
    get() {
      return [];
    },
    set(newValue) {
      window.SLIWIPI_rgGames = newValue;
    }
  });

  function onReady() {
    let str = window.BuildGameRow.toString().split('\n');

    function comment(line) {
      str[line] = '//' + str[line];
    }

    if (str.length !== 111)
      return;

    /* I think including the actual code from the page with slight modifications
     would be illegal?.. So this array contains the numbers of lines in the original
     function that should be commented out. */
    let lines = [
      69, 70, 71, 72, 73, 74,
      81, 82, 83, 84,
      92, 93, 94, 95,
      98,
      100, 101, 102, 103, 104, 105,
      107, 108, 109
    ];

    for (let line of lines) {
      comment(line);
    }

    let s = document.createElement('script');
    s.textContent = str.join('\n');
    document.head.appendChild(s);
    s.parentNode.removeChild(s);

    window.SLIWIPI_BUILD_GAME_ROW_PATCHED = true;

    delete window.rgGames;
    window.rgGames = window.SLIWIPI_rgGames;
    delete window.SLIWIPI_rgGames;
  }

  document.addEventListener('DOMContentLoaded', onReady);
})();