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
  perPage: document.querySelector('#wishlist-per-page')
};
let library = {
  enabled: document.querySelector('#library-enabled'),
  perPage: document.querySelector('#library-per-page')
};
let language = {
  options: document.querySelector('#options-language'),
  main: document.querySelector('#features-language')
};
const POSSIBLE_LANGUAGES = Object.values(LIST_AVAILABLE_LANGUAGES).concat(['auto']);
function saveOptions() {
  let data = {
    wishlist: {
      enabled: wishlist.enabled.checked,
      perPage: parseInt(wishlist.perPage.value, 10)
    },
    library: {
      enabled: library.enabled.checked,
      perPage: parseInt(library.perPage.value, 10)
    },
    language: {
      options: language.options.value,
      main: language.main.value
    }
  };
  storage.sync.set(data);

  applyTranslation(true);
}
wishlist.enabled.addEventListener('change', saveOptions);
wishlist.perPage.addEventListener('change', saveOptions);

library.enabled.addEventListener('change', saveOptions);
library.perPage.addEventListener('change', saveOptions);

language.options.addEventListener('change', saveOptions);
language.main.addEventListener('change', saveOptions);

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
      perPage: 15
    },
    library: {
      enabled: true,
      perPage: 15
    },
    language: {
      options: 'auto',
      main: 'auto'
    }
  });

  if (data.wishlist.enabled) {
    wishlist.enabled.checked = true;
  }
  wishlist.perPage.value = data.wishlist.perPage;

  if (data.library.enabled) {
    library.enabled.checked = true;
  }
  library.perPage.value = data.library.perPage;

  language.options.value = data.language.options;
  language.main.value = data.language.main;

  applyTranslation();
}
restoreOptions();