/**
 * @type {object.<string, MoneyFormattingCurrency>}
 */
const CURRENCY_FORMATTING_RULES = {
  CLP: {
    groupSeparator: '.',
    fractionDigits: 0
  },
  JPY: {
    groupSeparator: ',',
    fractionDigits: 0,
  },
  KRW: {
    groupSeparator: '\'',
    fractionDigits: 0
  },
  INR: {
    groupAmount: 1
  },
  RUB: {
    groupSeparator: ' ',
    fractionSeparator: ','
  },
  BRL: {
    groupSeparator: '.',
    fractionSeparator: ','
  }
};
/**
 * @type {MoneyFormattingCurrency}
 */
const _DEFAULT_CURRENCY_FORMAT = {
  groupSeparator: ',',
  groupSize: 3,
  groupAmount: Infinity,
  group2Size: 2,
  fractionSeparator: '.',
  fractionDigits: 2,
  forceFraction: false
};
for(let currency in CURRENCY_FORMATTING_RULES) {
  CURRENCY_FORMATTING_RULES[currency] = Object.assign({}, _DEFAULT_CURRENCY_FORMAT, CURRENCY_FORMATTING_RULES[currency]);
}

/**
 * @typedef {object} MoneyFormattingCurrency
 * @property {string} [groupSeparator= ]
 * @property {number} [groupSize=3]
 * @property {number} [groupAmount=Infinity]
 * @property {string} [group2Separator=,]
 * @property {number} [group2Size=2]
 * @property {number} [fractionDigits=2]
 * @property {boolean} [forceFraction=false]
 */
/**
 * Get a formatted number for a currency you specify.
 * @param {number} number The number to format.
 * @param {string|MoneyFormattingCurrency} currency
 * containing currency name or an object describing formatting rules.
 */
function formatMoney(number, currency) {
  if(typeof currency === 'string')
    currency = Object.assign({}, _DEFAULT_CURRENCY_FORMAT, CURRENCY_FORMATTING_RULES[currency]);
  else if(typeof currency === 'object')
    currency = Object.assign({}, _DEFAULT_CURRENCY_FORMAT, currency);
  if(!currency)
    currency = _DEFAULT_CURRENCY_FORMAT;
  let num = number.toFixed(currency.fractionDigits);

  let sign = '';
  if(num.startsWith('-')) {
    sign = '-';
    num = num.substr(1);
  }

  let fraction;
  [num, fraction] = num.split('.');
  let groups = [];
  let amount = currency.groupAmount;
  while(num.length) {
    if(amount-- > 0) {
      groups.push(num.substr(-currency.groupSize));
      num = num.substr(0, num.length - currency.groupSize);
    } else {
      groups.push(num.substr(-currency.group2Size));
      num = num.substr(0, num.length - currency.group2Size);
    }
  }
  num = sign + groups.reverse().join(currency.groupSeparator || '');
  if((fraction && !REGEXP_EMPTY_FRACTION_PART.test(fraction)) || currency.forceFraction)
    num += currency.fractionSeparator + fraction;

  return num;
}