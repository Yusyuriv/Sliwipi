(async function() {
  let language = getCookie('Steam_Language');
  language = LIST_AVAILABLE_LANGUAGES[language] || 'en';
  let autoLanguage = language;

  const PAGINATION_BUTTONS_ALIGNMENT_ID = 'SLIWIPI-pagination-buttons-alignment';

  async function changeLanguage(data) {
    if(!data.newLanguage)
      return;
    language = data.newLanguage === 'auto' ? autoLanguage : data.newLanguage;

    LANGUAGE_DATA = await $.getJSON(chrome.extension.getURL(`/_locales/${language}/messages.json`));

    let s = document.createElement('script');
    s.innerHTML = `
      SLIWIPI.languageData = ${JSON.stringify(LANGUAGE_DATA)};
      SLIWIPI.reapplyPagination(SLIWIPI.pageNum);
    `;
    document.body.appendChild(s);
    s.parentNode.removeChild(s);
  }
  chrome.runtime.onMessage.addListener(changeLanguage);

  function changeButtonAlignment(data) {
    if(!data.newPaginationButtonsAlignment)
      return;
    let style = $('#' + PAGINATION_BUTTONS_ALIGNMENT_ID);
    if(!style.length) {
      style = $(`<style id="${PAGINATION_BUTTONS_ALIGNMENT_ID}"></style>`);
      $(document.head).append(style);
    }
    if(data.newPaginationButtonsAlignment === 'edges') {
      style.text(`
        .pagination-navprev { float: left; }
        .pagination-navnext { float: right; }
      `);
    } else if(data.newPaginationButtonsAlignment === 'fixed') {
      style.text(`
        .pagination-navprev {
          position: absolute;
          right: calc(50% + 236px);
        }
        .pagination-navnext {
          position: absolute;
          left: calc(50% + 226px);
        }
      `);
    } else if(data.newPaginationButtonsAlignment === 'dynamic') {
      style.text('');
    }
  }
  chrome.runtime.onMessage.addListener(changeButtonAlignment);

  let data = await storage.sync.get({
    paginationButtonsAlignment: 'dynamic'
  });
  changeButtonAlignment({
    newPaginationButtonsAlignment: data.paginationButtonsAlignment
  });
})();