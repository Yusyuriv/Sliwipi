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
const STR_EXTENSION_NAME = 'Library and Wishlist Peformance Fix';

/** Regexp for location after redirecting from <code>/wishlist</code> */
const REGEXP_LOCATION = /^https?:\/\/(?:www\.)?steamcommunity\.com\/(?:(?:id\/[^\/.]+)|(?:profiles\/\d{17}))\/games\/?(?:\?tab=recent)(?:[?&]cc=[a-z]{2})?#wishlist-redirected$/i;
/** A regexp for extracting the part of URL until <code>id/custom_url</code> or <code>profiles/profile_id</code> (inclusive) */
const REGEXP_LINK = /^(https?:\/\/(?:www\.)?steamcommunity\.com\/(?:(?:id\/[^\/.]+)|(?:profiles\/\d{17})))\/.+$/i;
/** A regexp for extracting user's sessionID from the store site */
const REGEXP_SESSIONID = /var g_sessionID = "(.+?)";/;
const REGEXP_MONEY_NUMBER = /^([^\d]*)(?:\d+(?:(?: |,|\.)\d*)?)(.*)$/;
const REGEXP_FORMATTED_NUMBER = /(\d(?:.*\d)?)/;
const REGEXP_NON_DIGIT = /[^\d]/g;
const REGEXP_LAST_NON_DIGIT = /[^\d](?!.*[^\d].*)/;
const REGEXP_EMPTY_FRACTION_PART = /^0+$/;

/** 12 hours in ms */
const TIME_12_HOURS = 1000 * 60 * 60 * 12;

const LINK_GAME_LIST_CSS = 'http://community.edgecast.steamstatic.com/public/css/skin_1/profile_games_list.css';
const LINK_GAME_CSS = 'http://store.edgecast.steamstatic.com/public/css/v6/game.css?v=MAcFD0Vgzrdm';
const LINK_STORE_API_REMOVE_FROM_WISHLIST = '//store.steampowered.com/api/removefromwishlist';
const LINK_STORE_ABOUT = `//store.steampowered.com/${location.protocol === 'http:' ? 'cart' : 'about'}/`;

const CLASS_OVERLAY = 'wishlist-performance-fix-overlay';
const CLASS_OVERLAY_CONTAINER = 'wishlist-performance-fix-overlay-container';

/** The list of languages this extension is translated into */
const LIST_AVAILABLE_LANGUAGES = {
  english: 'en',
  russian: 'ru',
  brazilian: 'pt_BR'
};
/** The list of all languages Steam supports */
const LIST_ALL_LANGUAGES = {
  bulgarian: 'bg',
  czech: 'cs',
  danish: 'da',
  dutch: 'nl',
  english: 'en',
  finnish: 'fi',
  french: 'fr',
  german: 'de',
  greek: 'el',
  hungarian: 'hu',
  italian: 'it',
  japanese: 'ja',
  koreana: 'ko',
  norwegian: 'no',
  polish: 'pl',
  portuguese: 'pt',
  brazilian: 'pt_BR',
  romanian: 'ro',
  russian: 'ru',
  schinese: 'zh',
  spanish: 'es',
  swedish: 'sv',
  tchinese: 'zh',
  thai: 'th',
  turkish: 'tk',
  ukrainian: 'uk'
};
/** The list of currencies and their locales for formatting numbers */
const LIST_CURRENCY_TO_LANGUAGE = {
  USD: "en",
  GBP: "en_GB",
  EUR: "de",
  CHF: "de",
  RUB: "ru",
  BRL: "pt_BR",
  JPY: "ja",
  NOK: "no",
  IDR: "id",
  MYR: "en",
  PHP: "tl",
  SGD: "en",
  THB: "th",
  VND: "vi",
  KRW: "ko",
  TRY: "tk",
  UAH: "uk",
  MXN: "es",
  CAD: "en",
  AUD: "en",
  NZD: "en",
  PLN: "pl",
  CNY: "zh",
  INR: "hi",
  CLP: "es",
  PEN: "es",
  COP: "es",
  ZAR: "af",
  HKD: "zh",
  TWD: "zh",
  SAR: "ar",
  AED: "ar",
  RMB: "zh",
  NXP: "ko"
};

const FILE_SIZE_MULTIPLIER = {
  B:   Math.pow(1024, 0),
  KiB: Math.pow(1024, 1),
  MiB: Math.pow(1024, 2),
  GiB: Math.pow(1024, 3),
  TiB: Math.pow(1024, 4),
  PiB: Math.pow(1024, 5),
  EiB: Math.pow(1024, 6),
  ZiB: Math.pow(1024, 7),
  YiB: Math.pow(1024, 8)
};