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

/**
 * Goes through all elements on the page that have the specified attribute and replaces its text with localized value using Chrome's locale files
 * @param {string} attrName For example, <code>'data-i18n'</code>
 */
function i18nDOM(attrName) {
  let nodes = document.querySelectorAll(`[${attrName}]`);
  attrName = attrName.replace(/^data-/, '');
  for(let node of nodes) {
    let data = node.dataset[attrName + 'Data'];
    if(data) {
      data = JSON.parse(data);
    }
    let str = chrome.i18n.getMessage(node.dataset[attrName], data);
    if(str) {
      node.textContent = str;
    }
  }
}
/**
 * Goes through all elements on the page that have the specified attribute and replaces its text with localized value using the provided object
 * @param {string} attrName For example, <code>'data-i18n'</code>
 * @param {object} phrases An object containing phrases translated in the required language
 * @param {string} selector Only apply localization for a specific selector
 */
i18nDOM.nonchrome = function(attrName, phrases, selector = '') {
  let nodes = document.querySelectorAll(selector + `[${attrName}]`);
  attrName = attrName.replace(/^data-/, '');
  for(let node of nodes) {
    let str = phrases[node.dataset[attrName]];
    if(str && !node.dataset.i18nOriginalText) {
      node.dataset.i18nOriginalText = node.textContent.trim();
    }
    if(str) {
      node.textContent = str.message;
    }
    if(!str && node.dataset.i18nOriginalText) {
      node.textContent = node.dataset.i18nOriginalText;
    }
  }
};