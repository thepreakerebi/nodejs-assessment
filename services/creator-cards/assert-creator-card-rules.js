const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { CreatorCardMessages } = require('@app/messages');

const SLUG_PATTERN = /^[A-Za-z0-9_-]+$/;
const ACCESS_CODE_PATTERN = /^[A-Za-z0-9]{6}$/;

function assertCreatorCardRules(data) {
  let response;

  if (data.slug && !SLUG_PATTERN.test(data.slug)) {
    throwAppError(CreatorCardMessages.INVALID_SLUG, ERROR_CODE.INVLDDATA);
  }

  if (data.access_code && !ACCESS_CODE_PATTERN.test(data.access_code)) {
    throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE_FORMAT, ERROR_CODE.INVLDDATA);
  }

  if (data.access_type === 'private' && !data.access_code) {
    throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED, ERROR_CODE.AC01);
  }

  if (data.access_type !== 'private' && data.access_code) {
    throwAppError(CreatorCardMessages.ACCESS_CODE_PUBLIC_ONLY, ERROR_CODE.AC05);
  }

  if (data.service_rates) {
    if (!Array.isArray(data.service_rates.rates) || !data.service_rates.rates.length) {
      throwAppError(CreatorCardMessages.SERVICE_RATES_REQUIRED, ERROR_CODE.INVLDDATA);
    }

    data.service_rates.rates.forEach((rate) => {
      if (!Number.isInteger(rate.amount) || rate.amount < 1) {
        throwAppError(
          CreatorCardMessages.INVALID_SERVICE_RATE_AMOUNT,
          ERROR_CODE.INVLDDATA
        );
      }
    });
  }

  if (data.links) {
    data.links.forEach((link) => {
      if (!link.url.startsWith('http://') && !link.url.startsWith('https://')) {
        throwAppError('links[].url must start with http:// or https://', ERROR_CODE.INVLDDATA);
      }
    });
  }

  response = true;

  return response;
}

module.exports = assertCreatorCardRules;
