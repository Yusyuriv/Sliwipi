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
  let str = BuildGameRow.toString().split('\n');

  function comment(line) {
    str[line] = '//' + str[line];
  }

  if(str.length !== 94)
    return;

  /* I think including the actual code from the page with slight modifications
  would be illegal?.. So this array contains the numbers of lines in the original
  function that should be commented out. */
  let lines = [
    65, 66, 67, 68,
    75, 76, 77, 78,
    81, 83, 84, 85, 87, 88,
    90, 91, 92
  ];
  for(let line of lines) {
    comment(line);
  }

  str = str.join('\n');
  str += '\nwindow.SLIWIPI_BUILD_GAME_ROW_PATCHED = true;';

  let s = document.createElement('script');
  s.innerHTML = str;
  document.head.appendChild(s);
  s.parentNode.removeChild(s);
})();