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

(async function () {
  let wishlist = await storage.sync.get({
    wishlist: {
      enabled: true,
      perPage: 15
    },
    language: {
      main: 'auto'
    }
  });

  let mainLanguage = wishlist.language.main;

  const DEBUG = !chrome.runtime.getManifest().update_url;
  wishlist = wishlist.wishlist;
  if (!wishlist.enabled)
    return;

  let styleLink = document.createElement('link');
  styleLink.href = LINK_GAME_CSS;
  styleLink.rel = 'stylesheet';
  document.head.appendChild(styleLink);

  let link1 = document.createElement('link');
  link1.href = chrome.extension.getURL('/css/common.css');
  link1.rel = 'stylesheet';
  document.head.appendChild(link1);

  let link2 = document.createElement('link');
  link2.href = chrome.extension.getURL('/css/wishlist-performance.css');
  link2.rel = 'stylesheet';
  document.head.appendChild(link2);

  let origCurrencies = await get.promise('g_rgCurrencyData');
  let currencies = {};
  for(let currencyName in origCurrencies) {
    let origCurrency = origCurrencies[currencyName];
    currencies[origCurrency.strSymbol] = LIST_CURRENCY_TO_LANGUAGE[origCurrency.strCode];
  }
  let numberFormattingLanguage;

  let autoLanguage = getCookie('Steam_Language');
  autoLanguage = LIST_AVAILABLE_LANGUAGES[autoLanguage] || 'en';

  let actualLanguage = mainLanguage === 'auto' ? autoLanguage : mainLanguage;

  let sortingBy = 'rank';
  let filterBy = 'all';

  let LANGUAGE_DATA = await $.getJSON(chrome.extension.getURL(`/_locales/${actualLanguage}/messages.json`));

  async function changeLanguage(data) {
    if(!data.newLanguage)
      return;
    actualLanguage = data.newLanguage === 'auto' ? autoLanguage : data.newLanguage;
    LANGUAGE_DATA = await $.getJSON(chrome.extension.getURL(`/_locales/${actualLanguage}/messages.json`));
    i18nDOM.nonchrome('data-i18n', LANGUAGE_DATA);
    regeneratePagination(pageNum);
  }
  chrome.runtime.onMessage.addListener(changeLanguage);

  function determineNumberFormattingRules($priceElement) {
    if(!numberFormattingLanguage && $priceElement) {
      let currencySymbol = $priceElement.textContent.replace(REGEXP_FORMATTED_NUMBER, '').trim();
      let lang = currencies[currencySymbol];
      if(lang)
        numberFormattingLanguage = lang.replace('_', '-');
    }
  }

  function parsePrices(elem) {
    if (!elem)
      return 0;
    let str = elem.textContent.trim();
    str = str.match(REGEXP_FORMATTED_NUMBER);
    str = str ? str[1] : null;
    if(str == null)
      return 0;
    str = str.split(REGEXP_LAST_NON_DIGIT).map(n => n.replace(REGEXP_NON_DIGIT, '')).join('.');
    str = str ? parseFloat(str) : 0;
    return isNaN(str) ? 0 : str;
  }

  function formatMoney(num) {
    num = num.toLocaleString(numberFormattingLanguage || 'en', {minimumFractionDigits: 2});
    if(num.substr(-2) === '00')
      num = num.substr(0, num.length - 3);
    return num;
  }

  function addWishlistTotalData() {
    let totalPrice = 0, itemNames = [];
    for(let row of originalData) {
      totalPrice += row.price;
      itemNames.push(row.name);
    }
    let $wishlistTotal = $('.game_area_purchase_game_wrapper').css('display', 'block');
    let $wishlistTotalAmount = $wishlistTotal.find('.package_contents > b');
    let $wishlistTotalList = $wishlistTotal.find('.package_contents > span');
    $wishlistTotalList.text(itemNames.join(', '));
    $wishlistTotalAmount.text($wishlistTotalAmount.text().replace(/\d+/, itemNames.length));
    let $wishlistTotalPrice = $wishlistTotal.find('.price');
    if(wishlistStrings.totalPrice) {
      totalPrice = formatMoney(totalPrice);
      $wishlistTotalPrice.text(
        wishlistStrings.totalPrice.replace('0', totalPrice)
      );
    }
  }

  let wishlistStrings = {};

  let originalData = [];
  let filteredData = [];
  let currentPage = [];
  let pageNum = 1;

  let showSaveChangesA1 = $('#global_actions').find('> a.user_avatar');
  let showSaveChangesA2 = $('.profile_small_header_bg').find('.profile_small_header_texture > a');
  let showSaveChanges = showSaveChangesA1.length && showSaveChangesA2.length && showSaveChangesA1.attr('href').startsWith(showSaveChangesA2.attr('href'));

  let storeSessionid, sessionid;

  async function getStoreSessionId() {
    sessionid = await get.promise('g_sessionID');
    $('#update-sorting').find('[name="sessionid"]').val(sessionid);
    if (!sessionid || !showSaveChanges)
      return;
    let session = await storage.get({storeSession: {id: null, lastUpdated: 0}});
    session = session.storeSession;
    if (session.id)
      storeSessionid = session.id;

    if (Date.now() - session.lastUpdated > TIME_12_HOURS) {
      let result = await $.ajax({url: LINK_STORE_ABOUT});
      let match = result.match(REGEXP_SESSIONID)[1];
      if (match) {
        storage.set({storeSession: {id: match, lastUpdated: Date.now()}});
        storeSessionid = match;
      }
    }
    return storeSessionid;
  }

  getStoreSessionId();

  let $listing, $elementsToHide;

  let removing = 0;

  function changeRank(e) {
    let inputName = e.currentTarget.getAttribute('name');

    $('#update-sorting').find(`[name="${inputName}"]`).val(e.currentTarget.value);

    $('.btn-save-changes')
      .removeClass('btnv6_blue_hoverfade btn_disabled')
      .addClass('btn_green_white_innerfade');
  }

  async function removeFromWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!storeSessionid)
      return;
    removing++;
    let $parent = $(e.currentTarget).parent().parent().parent().addClass('overlay-visible');
    let $overlay = $parent.find('.' + CLASS_OVERLAY).show();
    let result;
    let appid = e.currentTarget.dataset.id;
    let priority = $(`[name="priority[${appid}]"]`);
    let priorityOriginal = $(`[name="orig_priority[${appid}]"]`);

    try {
      result = await $.ajax({
        type: 'POST',
        url: LINK_STORE_API_REMOVE_FROM_WISHLIST,
        data: {sessionid: storeSessionid, action: 'remove', appid}
      });
    } catch (e) {
    }
    removing--;
    if (result && result.success === true) {
      originalData = originalData.filter(v => v.id !== appid);
      priority.remove();
      priorityOriginal.remove();
      priority = parseInt(priority.val(), 10);
      if (!originalData.find(v => v.priority === priority)) {
        for (let row of originalData) {
          if (row.priority > priority) {
            $(`[name="priority[${row.id}]"]`).val(--row.priority);
          }
        }
      }
      if (removing > 0)
        $overlay.addClass('overlay-done').text('removed');
      else {
        filterData(pageNum, true);
        let totalPrice = 0;
        let itemNames = [];
        for (let item of originalData) {
          totalPrice += item.price;
          itemNames.push(item.name);
        }
        addWishlistTotalData(totalPrice, itemNames);
      }
      return;
    }
    $parent.removeClass('overlay-visible');
    if (removing === 0) {
      filterData(pageNum, true);
    } else {
      $overlay.hide();
    }
  }

  function regeneratePagination(page = 1) {
    $('.sliwipi-pagination').pagination({
      elements: filteredData,
      perPage: wishlist.perPage,
      change: changePage,
      currentPage: page,
      languageData: LANGUAGE_DATA
    });
    changePage(page);
  }

  function changePage(num) {
    pageNum = num;
    let start = (num - 1) * wishlist.perPage;
    currentPage = filteredData.slice(start, start + wishlist.perPage);
    renderPage();
  }

  function filterData(page = 1) {
    if (typeof page === 'object') page = 1;
    let filterByName = $('#game-name-filter').val().trim().toLowerCase();

    let sortingFunction;
    switch(sortingBy) {
      case 'rank':
        sortingFunction = firstBy('rank').thenBy('name');
        break;
      case 'name':
        sortingFunction = firstBy('name');
        break;
      case 'price':
        sortingFunction = firstBy((a, b) => {
          return a.price === 0 ? Infinity : a.price - b.price;
        }).thenBy('name');
        break;
      case 'percent':
        sortingFunction = firstBy('percent', { direction: -1 }).thenBy('name');
        break;
      case 'diff':
        sortingFunction = firstBy('diff', { direction: -1 }).thenBy('name');
        break;
    }

    filteredData = JSON.parse(JSON.stringify(originalData));
    filteredData = filteredData.filter(row => {
      if (filterBy === 'discount' && row.percent === 0)
        return false;
      return !(filterByName && row.name.toLowerCase().indexOf(filterByName) === -1);
    }).sort(sortingFunction);

    regeneratePagination(page);
    addWishlistTotalData();
  }

  function renderPage() {
    let html = '';
    for (let item of currentPage) {
      html += item.html;
    }
    $listing.html(html);

    let actualListing = $('.actual-listing');
    $('#update-sorting').find('input[name^="priority"]').each(function () {
      actualListing.find(`[name="${this.getAttribute('name')}"]`).val(this.value);
    });
  }

  if (REGEXP_LOCATION.test(location.href)) {
    (async function () {
      let linkElem = document.createElement('link');
      linkElem.href = LINK_GAME_LIST_CSS;
      linkElem.rel = 'stylesheet';
      document.head.appendChild(linkElem);

      let link = location.href.replace(REGEXP_LINK, '$1');
      link = link + '/wishlist/';
      history.replaceState({}, 'Steam Community :: Wishlist', link);

      let html = await $.ajax({
        url: chrome.extension.getURL('/html/wishlist.html'),
        dataType: 'text'
      });
      document.querySelector('#tabs_basebg').innerHTML = html;
      let updateSortingForm = $('#update-sorting');
      let btnSaveChanges = $('.btn-save-changes');
      if (!showSaveChanges) {
        btnSaveChanges.remove();
        updateSortingForm.remove();
        updateSortingForm = null;
      }

      function changeDropdwonLabel(target) {
        let label = target.parentNode.parentNode.parentNode.querySelector('.sliwipi-dropdown-label');
        label.textContent = target.textContent;
        label.dataset.i18n = target.dataset.i18n;
      }

      $('#sliwipi-sort-by-pulldown').on('click', 'a', function(e) {
        changeDropdwonLabel(e.target);
        e.preventDefault();

        sortingBy = this.dataset.data;
        filterData();
      });

      $('#sliwipi-filter-by-pulldown').on('click', 'a', function(e) {
        changeDropdwonLabel(e.target);
        e.preventDefault();

        filterBy = this.dataset.data;
        filterData();
      });

      i18nDOM.nonchrome('data-i18n', LANGUAGE_DATA);

      $('.sectionTab.active').attr('class', 'sectionTab');
      $('.sectionTab[href$="/wishlist/"]').addClass('sectionTab active');

      $listing = $('.sliwipi-actual-listing');
      $elementsToHide = $('.sliwipi-filters-container > *').css('visibility', 'hidden');

      $listing.on('change', '.wishlist_rank', changeRank);
      $listing.on('click', '.wishlist_added_on > a', removeFromWishlist);

      btnSaveChanges.on('click', function () {
        if (!$(this).hasClass('btn_disabled')) {
          updateSortingForm.submit();
        }
      });

      if(DEBUG)
        console.time(STR_EXTENSION_NAME + ': Downloading wishlist');
      $.get(link, function(data) {
        if(DEBUG) {
          console.timeEnd(STR_EXTENSION_NAME + ': Downloading wishlist');
          console.time(STR_EXTENSION_NAME + ': Parsing');
        }
        let spinnerLabel = document.querySelector('.sliwipi-loading-spinner > h1');
        spinnerLabel.textContent = spinnerLabel.dataset.i18nOriginalText = 'Preparing...';
        spinnerLabel.dataset.i18n = 'wishlist_parsing';
        i18nDOM.nonchrome('data-i18n', LANGUAGE_DATA);

        setTimeout(function() {
          let parser = new DOMParser();
          parser = parser.parseFromString(data, 'text/html');
          let $items = parser.querySelectorAll('.wishlistRow');
          for (let $item of $items) {
            $item.classList.add(CLASS_OVERLAY_CONTAINER);
            let overlay = document.createElement('div');
            overlay.className = CLASS_OVERLAY;
            overlay.style.display = 'none';
            $item.insertBefore(
              overlay,
              $item.childNodes[0]
            );
            $item.classList.remove('sortableRow');
            let id = $item.id.split('_')[1];
            let name = $item.querySelector('h4.ellipsis').textContent.trim();
            let discounted = $item.querySelector('.discount_block');
            let percent = 0, diff = 0, price = 0;
            let rank = $item.querySelector('.wishlist_rank,.wishlist_rank_ro');
            rank = (rank ? rank.value || rank.textContent.trim() : '0').trim();
            rank = parseInt(rank, 10);
            let totalPriceStr;
            if (discounted) {
              percent = parseFloat($item.querySelector('.discount_pct').textContent.trim().replace(/[^\d]/g, ''));
              let $priceElement = $item.querySelector('.discount_original_price');
              if(!wishlistStrings.totalPrice)
                totalPriceStr = $priceElement.textContent.trim();
              determineNumberFormattingRules($priceElement);
              price = parsePrices($priceElement);
              $priceElement.textContent = $priceElement.textContent.replace(REGEXP_FORMATTED_NUMBER, formatMoney(price));
              let $finalPrice = $item.querySelector('.discount_final_price');
              let finalPrice = parsePrices($finalPrice);
              diff = price - finalPrice;
              let diffClass = diff > 0 ? 'sliwipi-discount-savings' : 'sliwipi-discount-anti-savings';
              let finalPriceTempl = $finalPrice.textContent.trim().replace(REGEXP_MONEY_NUMBER, `$1 ${formatMoney(-diff)} $2`);
              $finalPrice.innerHTML = `<div class="${diffClass}">${finalPriceTempl}</div> ` + $finalPrice.innerHTML.replace(REGEXP_FORMATTED_NUMBER, formatMoney(finalPrice));

              price = finalPrice;
            } else {
              let $priceElement = $item.querySelector('.price');
              determineNumberFormattingRules($priceElement);
              price = parsePrices($priceElement);
              if(price > 0) {
                if(!wishlistStrings.totalPrice)
                  totalPriceStr = $priceElement.textContent.trim();
                $priceElement.textContent = $priceElement.textContent.replace(REGEXP_FORMATTED_NUMBER, formatMoney(price));
              }
            }

            if (!wishlistStrings.totalPrice && price) {
              wishlistStrings.totalPrice = totalPriceStr.replace(REGEXP_FORMATTED_NUMBER, '0');
            }

            if (showSaveChanges) {
              let $removeLink = $item.querySelector('.wishlist_added_on > a[onclick]');
              if ($removeLink) {
                $removeLink.removeAttribute('onclick');
                $removeLink.dataset.id = id;
              }
              $($item)
                .find('.wishlistRankCtn > input')
                .removeAttr('onchange')
                .clone()
                .removeAttr('class')
                .attr('type', 'hidden')
                .appendTo(updateSortingForm);
            }
            originalData.push({id, name, rank, price, percent, diff, html: $($item).wrap('<div></div>').parent().html()});
          }
          if(DEBUG)
            console.timeEnd(STR_EXTENSION_NAME + ': Parsing');

          filterData();

          addWishlistTotalData();

          $('#game-name-filter').on('input', originalData.length > 500 ? debounce(500, filterData) : filterData);
          $elementsToHide.css('visibility', 'visible');
        }, 50)
      });
    })();
  }
})();