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

let wishlist = {
  enabled: document.querySelector('#wishlist-enabled'),
  perPage: document.querySelector('#wishlist-per-page'),
  sortBy: document.querySelector('#wishlist-sorting'),
  useJPY: document.querySelector('#use-jpy')
};
let library = {
  enabled: document.querySelector('#library-enabled'),
  perPage: document.querySelector('#library-per-page'),
  sortBy: document.querySelector('#library-sorting')
};
let language = {
  options: document.querySelector('#options-language'),
  main: document.querySelector('#features-language')
};
let paginationButtonsAlignment = document.querySelector('#pagination-buttons-alignment');
const POSSIBLE_LANGUAGES = Object.values(LIST_AVAILABLE_LANGUAGES).concat(['auto']);
function saveOptions() {
  let data = {
    wishlist: {
      enabled: wishlist.enabled.checked,
      perPage: parseInt(wishlist.perPage.value, 10),
      sortBy: wishlist.sortBy.value,
      useJPY: wishlist.useJPY.checked
    },
    library: {
      enabled: library.enabled.checked,
      perPage: parseInt(library.perPage.value, 10),
      sortBy: library.sortBy.value
    },
    language: {
      options: language.options.value,
      main: language.main.value
    },
    paginationButtonsAlignment: paginationButtonsAlignment.value
  };
  storage.sync.set(data);

  applyTranslation(true);
  alignPaginationButtons();
}
wishlist.enabled.addEventListener('change', saveOptions);
wishlist.perPage.addEventListener('change', saveOptions);
wishlist.sortBy.addEventListener('change', saveOptions);

library.enabled.addEventListener('change', saveOptions);
library.perPage.addEventListener('change', saveOptions);
library.sortBy.addEventListener('change', saveOptions);

language.options.addEventListener('change', saveOptions);
language.main.addEventListener('change', saveOptions);

paginationButtonsAlignment.addEventListener('change', saveOptions);

function alignPaginationButtons() {
  chrome.tabs.query({
    url: [
      'http://steamcommunity.com/*/games*',
      'http://steamcommunity.com/*/wishlist*'
    ]
  }, function (tabs) {
    for(let tab of tabs) {
      chrome.tabs.sendMessage(tab.id, {newPaginationButtonsAlignment: paginationButtonsAlignment.value});
    }
  });
}
async function applyTranslation(sendMessage) {
  let lang;
  if (language.options.value !== 'auto') {
    lang = language.options.value;
  } else {
    lang = navigator.language.replace('-', '_');
    if (!POSSIBLE_LANGUAGES.includes(lang)) {
      lang = 'en';
    }
  }
  let strings = await $.getJSON(chrome.extension.getURL(`/_locales/${lang}/messages.json`));
  i18nDOM.nonchrome('data-i18n', strings);

  if (sendMessage) {
    chrome.tabs.query({
      url: [
        'http://steamcommunity.com/*/games*',
        'http://steamcommunity.com/*/wishlist*'
      ]
    }, function (tabs) {
      for(let tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {newLanguage: language.main.value});
      }
    });
  }
}

async function restoreOptions() {
  let data = await storage.sync.get({
    wishlist: {
      enabled: true,
      perPage: 15,
      sortBy: 'rank',
      useJPY: false
    },
    library: {
      enabled: true,
      perPage: 15,
      sortBy: 'name'
    },
    language: {
      options: 'auto',
      main: 'auto'
    },
    paginationButtonsAlignment: 'dynamic'
  });

  if (data.wishlist.enabled) {
    wishlist.enabled.checked = true;
  }
  wishlist.perPage.value = data.wishlist.perPage;
  wishlist.sortBy.value = data.wishlist.sortBy;

  if (data.library.enabled) {
    library.enabled.checked = true;
  }
  library.perPage.value = data.library.perPage;
  library.sortBy.value = data.library.sortBy;

  language.options.value = data.language.options;
  language.main.value = data.language.main;

  paginationButtonsAlignment.value = data.paginationButtonsAlignment;

  applyTranslation();
}
restoreOptions();