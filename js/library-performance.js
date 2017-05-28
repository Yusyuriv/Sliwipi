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

/** @var {object} $ */

(async function () {
  let library = await storage.sync.get({
    library: {
      perPage: 15,
      enabled: true,
      sortBy: 'name'
    },
    language: {
      main: 'auto'
    }
  });
  let mainLanguage = library.language.main;
  library = library.library;
  if (!library.enabled)
    return;

  let language = getCookie('Steam_Language');
  language = LIST_AVAILABLE_LANGUAGES[language] || 'en';
  let autoLanguage = language;
  language = mainLanguage === 'auto' ? language : mainLanguage;
  let LANGUAGE_DATA = $.getJSON(chrome.extension.getURL(`/_locales/${language}/messages.json`));

  async function onReady() {
    LANGUAGE_DATA = await LANGUAGE_DATA;

    let link1 = document.createElement('link');
    link1.setAttribute('rel', 'stylesheet');
    link1.setAttribute('href', chrome.extension.getURL('/css/common.css'));
    document.head.appendChild(link1);

    let link2 = document.createElement('link');
    link2.setAttribute('rel', 'stylesheet');
    link2.setAttribute('href', chrome.extension.getURL('/css/library-performance.css'));
    document.head.appendChild(link2);

    let html = await $.ajax({
      url: chrome.extension.getURL('/html/library.html'),
      dataType: 'text'
    });

    let s = document.createElement('script');
    s.innerHTML = `window.SLIWIPI = { 
      perPage: ${library.perPage},
      languageData: ${JSON.stringify(LANGUAGE_DATA)},
      fileSizeMultipliers: ${JSON.stringify(FILE_SIZE_MULTIPLIER)},
      sortBy: ${JSON.stringify(library.sortBy)},
      html: \`${encodeURIComponent(html)}\`
    };`;
    document.body.appendChild(s);
    s.parentNode.removeChild(s);

    s = document.createElement('script');
    s.src = chrome.extension.getURL('/js/debounce.js');
    document.body.appendChild(s);
    s.parentNode.removeChild(s);

    s = document.createElement('script');
    s.src = chrome.extension.getURL('/js/is-in-viewport.js');
    document.body.appendChild(s);
    s.parentNode.removeChild(s);

    s = document.createElement('script');
    s.src = chrome.extension.getURL('/js/thenBy.js');
    document.body.appendChild(s);
    s.parentNode.removeChild(s);

    s = document.createElement('script');
    s.src = chrome.extension.getURL('/js/dom-i18n.js');
    document.body.appendChild(s);
    s.parentNode.removeChild(s);

    s = document.createElement('script');
    s.src = chrome.extension.getURL('/js/pagination.js');
    document.body.appendChild(s);
    s.parentNode.removeChild(s);

    s = document.createElement('script');
    s.src = chrome.extension.getURL('/js/library-performance-injectable.js');
    document.body.appendChild(s);
    s.parentNode.removeChild(s);
  }

  if(document.readyState === 'interactive' || document.readyState === 'complete')
    onReady();
  else
    document.addEventListener('DOMContentLoaded', onReady);
})();