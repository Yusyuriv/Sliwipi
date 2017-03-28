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
 * @property {function} String.prototype.escapeHTML
 * @property {string} HTMLElement.prototype.dataset.img
 */
/**
 * @typedef {object} IGameInfo
 * @property {string} name
 * @property {string} appid
 * @property {string|null} hours_forever
 * @property {string|null} hours_message
 * @property {string|null} stats_links
 * @property {string|null} stats_button
 * @property {number} hours
 * @property {object} client_summary
 * @property {number} installedSize
 * @property {boolean} status
 * @property {boolean} played
 * @property {object} availStatLinks
 * @property {string|null} item_background
 * @property {string} logo
 * @property {string} persona_name
 * @property {string} profile_link
 * @property {string} name_encoded
 * @property {string} name_escaped
 * @property {string} info_link
 */
/**
 * @typedef {object} PaginationPluginParams
 * @property {number} currentPage
 * @property {Array} elements
 * @property {number} perPage
 * @property {function} change
 * @property {object} languageData
 */
/**
 * @typedef {object} ITemplate
 * @property {string} template
 * @property {RegExp} pattern
 */

/**
 * @method
 * @name ITemplate#evaluate
 * @param {object}
 * @returns {string}
 */

/**
 * @typedef {object} ISliwipi
 * @property {number} perPage
 * @property {Array} languageData
 * @property {object} fileSizeMultipliers
 * @property {string} html
 */

/** @var {object[]} rgGames */
/** @var {ISliwipi} SLIWIPI */
/** @var {Template} gameLinksPopupTemplate */
/** @var {Template} gameStatsPopupTemplate */
/** @var {Template} gameTemplate */
/** @var {Template} gameStatsAchievementsTemplate */
/** @var {Template} gameStatsLeaderboardTemplate */
/** @var {Template} gameStatsGlobalAchievementsTemplate */
/** @var {Template} gameStatsGlobalLeaderboardsTemplate */
/** @var {Template} gameHoursForeverTemplate */
/** @var {Template} gameStatsTemplate */
/** @var {Template} gameStatsUserTemplate */
/** @var {string} personaName */
/** @var {string} profileLink */
/** @var {function} UpdateGameInfoFromSummary */
/** @var {object} jQuery */
/** @var {object} $J */
/** @var {boolean} SLIWIPI_BUILD_GAME_ROW_PATCHED */

(async function ($, $J) {
  if ($J)
    $ = $J;
  if(!window.SLIWIPI_BUILD_GAME_ROW_PATCHED)
    return;
  document.querySelector('#games_list_rows').innerHTML = '<div class="wishlist-owned-list-pagination"></div><div class="sliwipi-actual-list"></div><div class="wishlist-owned-list-pagination"></div>';

  let hideUnnecessaryOptionsImg1 = document.querySelector('#global_actions > a > img');
  let hideUnnecessaryOptionsImg2 = document.querySelector('.profile_small_header_avatar > .playerAvatar > img');
  let hideUnnecessaryOptions = !hideUnnecessaryOptionsImg1 || !hideUnnecessaryOptionsImg2 || hideUnnecessaryOptionsImg1.getAttribute('src') !== hideUnnecessaryOptionsImg2.getAttribute('src').replace('_medium', '');

  const originalData = JSON.parse(JSON.stringify(rgGames)).map(/**IGameInfo*/row => {
    row.hours = row.hours_forever ? parseFloat(row.hours_forever.replace(/,/g, '')) : 0;
    if(!row.client_summary) {
      row.client_summary = {
        localContentSize: '0 B'
      };
    }
    let splitSize = row.client_summary.localContentSize.split(' ');
    let size = parseFloat(splitSize[0]) * SLIWIPI.fileSizeMultipliers[splitSize[1]];
    if (isNaN(size))
      size = 0;
    row.installedSize = size;
    row.status = row.installedSize > 0;

    row.played = row.hours > 0;

    return row;
  });
  let filteredData = originalData;

  SLIWIPI.html = decodeURIComponent(SLIWIPI.html);

  let gameslistSortOptions = document.querySelector('#gameslist_sort_options');
  gameslistSortOptions.id = '';
  gameslistSortOptions.innerHTML = SLIWIPI.html;

  let filterGamesLabel = document.createElement('span');
  filterGamesLabel.dataset.i18n = 'wishlist_filter';
  gameslistSortOptions.parentNode.insertBefore(filterGamesLabel, gameslistSortOptions.nextSibling);
  filterGamesLabel.parentNode.removeChild(filterGamesLabel.nextSibling);

  if(hideUnnecessaryOptions) {
    document.querySelectorAll('[data-data="installedSize"],[data-data$="installed"]').forEach(v => {
      v.parentNode.removeChild(v);
    });
  }

  let sortingBy = 'name';
  let filterBy = 'all';

  function changeDropdownLabel(target) {
    let label = target.parentNode.parentNode.parentNode.querySelector('.sliwipi-dropdown-label');
    label.textContent = target.textContent;
    label.dataset.i18n = target.dataset.i18n;
  }
  $('#sliwipi-sort-by-dropdown').find('a').on('click', function(e) {
    changeDropdownLabel(this);
    e.preventDefault();

    sortingBy = this.dataset.data;
    predebounceFilterApps();
  });
  $('#sliwipi-filter-by-pulldown').find('a').on('click', function(e) {
    changeDropdownLabel(this);
    e.preventDefault();

    filterBy = this.dataset.data;
    predebounceFilterApps();
  });

  let filterInput = document.querySelector('#gameFilter');

  let popupsContainer = document.createElement('div');
  document.body.appendChild(popupsContainer);

  let listContainer = document.querySelector('.sliwipi-actual-list');

  let currentPage;
  SLIWIPI.pageNum = 1;

  const FILTER_OPTIONS = {
    all: 'all',
    installed: 'installed',
    noninstalled: '-installed',
    played: 'played',
    nonplayed: '-played'
  };
  const SORTING_OPTIONS = {
    name: 'name',
    playtime: 'playtime',
    installedSize: 'installedSize'
  };

  function filterOut() {
    let sortingFunction, filteringFunction;
    let name = filterInput.value.trim().toLowerCase();
    switch(sortingBy) {
      case SORTING_OPTIONS.name:
        sortingFunction = firstBy('name', { ignoreCase: true });
        break;
      case SORTING_OPTIONS.playtime:
        sortingFunction = firstBy('hours', { direction: -1 }).thenBy('name', { ignoreCase: true })
        break;
      case SORTING_OPTIONS.installedSize:
        sortingFunction = firstBy('installedSize', { direction: -1 }).thenBy('name', { ignoreCase: true });
        break;
    }
    switch(filterBy) {
      case FILTER_OPTIONS.all:
        filteringFunction = v => v.name.toLowerCase().includes(name);
        break;
      case FILTER_OPTIONS.installed:
        filteringFunction = v => v.name.toLowerCase().includes(name) && v.status;
        break;
      case FILTER_OPTIONS.noninstalled:
        filteringFunction = v => v.name.toLowerCase().includes(name) && !v.status;
        break;
      case FILTER_OPTIONS.played:
        filteringFunction = v => v.name.toLowerCase().includes(name) && v.played;
        break;
      case FILTER_OPTIONS.nonplayed:
        filteringFunction = v => v.name.toLowerCase().includes(name) && !v.played;
        break;
    }
    filteredData = originalData.filter(filteringFunction).sort(sortingFunction);
    window.filteredData = filteredData;
  }

  function reapplyPagination(num = 1) {
    $('.wishlist-owned-list-pagination').pagination({
      currentPage: num,
      elements: filteredData,
      perPage: SLIWIPI.perPage,
      change: changePage,
      languageData: SLIWIPI.languageData
    });
  }

  SLIWIPI.reapplyPagination = reapplyPagination;

  function predebounceFilterApps() {
    filterOut();
    changePage(1);
    reapplyPagination();
  }

  window.filterApps = rgGames.length > 1000 ? SLIWIPI.debounce(500, predebounceFilterApps) : predebounceFilterApps;

  function changePage(newPage) {
    SLIWIPI.pageNum = newPage;
    let start = SLIWIPI.perPage * (newPage - 1);
    currentPage = filteredData.slice(start, start + SLIWIPI.perPage);
    regenerateList();
  }

  function regenerateList() {
    let popupsHtml = '';
    let listHtml = '';
    for (let info of currentPage) {
      popupsHtml += `<div class="popup_block2" id="links_dropdown_${info.appid}" style="display: none;">${gameLinksPopupTemplate.evaluate(info)}</div>`;

      if (info.stats_links)
        popupsHtml += `<div class="popup_block2" id="stats_dropdown_${info.appid}" style="display: none;">${gameStatsPopupTemplate.evaluate(info)}</div>`;

      let html = gameTemplate.evaluate(info);

      listHtml += `<div class="gameListRow ${info.item_background || ''}" id="game_${info.appid}" data-img="${info.logo}">${html}</div>`;
    }

    popupsContainer.innerHTML = popupsHtml;
    listContainer.innerHTML = listHtml;
    document.querySelectorAll('.gameListRow').forEach(function (/**HTMLElement*/v) {
      v.querySelector('img').setAttribute('src', v.dataset.img);
    });
  }

  predebounceFilterApps();
})(jQuery, $J);