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

(function($, $J) {
  if($J)
    $ = $J;
  function generatePagination(currentPage, elements, perPage) {
    let html = '';
    let totalPages = Math.ceil(elements.length / perPage);
    if (totalPages <= 1)
      return '';
    if (currentPage > 1)
      html += '<button type="button" class="pagination-navprev btnv6_blue_hoverfade" data-i18n="pagination_button_prev">&lt; prev</button>';
    if(currentPage !== 1)
      html += '<button type="button" class="btnv6_blue_hoverfade">1</button>';
    else
      html += '<span>1</span>';
    if (currentPage > 2) {
      html += '<span>...</span>';
      if (currentPage === totalPages && totalPages > 3)
        html += '<button type="button" class="btnv6_blue_hoverfade">' + (currentPage - 2) + '</button>';
      html += '<button type="button" class="btnv6_blue_hoverfade">' + (currentPage - 1) + '</button>';
    }
    if (currentPage !== 1 && currentPage !== totalPages)
      html += '<span>' + currentPage + '</span>';
    if (currentPage < totalPages - 1) {
      html += '<button type="button" class="btnv6_blue_hoverfade">' + (currentPage + 1) + '</button>';
      if (currentPage === 1 && totalPages > 3)
        html += '<button type="button" class="btnv6_blue_hoverfade">' + (currentPage + 2) + '</button>';
      html += '<span>...</span>';
    }
    if(currentPage !== totalPages)
      html += '<button type="button" class="btnv6_blue_hoverfade">' + totalPages + '</button>';
    else
      html += '<span>' + totalPages + '</span>';
    if (currentPage < totalPages)
      html += '<button type="button" class="pagination-navnext btnv6_blue_hoverfade" data-i18n="pagination_button_next">next &gt;</button>';
    return html;
  }

  /**
   * @name PaginationPluginParams
   * @property {number} currentPage
   * @property {object[]} elements
   * @property {number} perPage Amount of items displayed per page
   * @property {object} languageData Object containing translated strings
   */
  /**
   * @param {PaginationPluginParams} obj
   */
  $.fn.pagination = function(obj) {
    let html = generatePagination(obj.currentPage, obj.elements, obj.perPage);
    let $this = $(this);
    $this
      .off('click')
      .on('click', 'button', function() {
        let $inner = $(this);
        let newPage = $inner.text();
        if ($inner.hasClass('pagination-navprev'))
          obj.currentPage--;
        else if ($inner.hasClass('pagination-navnext'))
          obj.currentPage++;
        else
          obj.currentPage = +newPage;
        let html = generatePagination(obj.currentPage, obj.elements, obj.perPage);
        $this.html(html);
        if(i18nDOM && obj.languageData) {
          i18nDOM.nonchrome('data-i18n', obj.languageData);
        }
        obj.change(obj.currentPage);
      })
      .html(html);
    if(i18nDOM && obj.languageData) {
      i18nDOM.nonchrome('data-i18n', obj.languageData);
    }
  };
})(jQuery, window.$J);