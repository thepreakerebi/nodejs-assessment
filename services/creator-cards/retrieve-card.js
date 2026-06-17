const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const CreatorCard = require('@app/repository/creator-card');
const { CreatorCardMessages } = require('@app/messages');
const serializeCard = require('./serialize-card');

const retrieveCardSpec = `root {
  slug string<trim|minLength:5|maxLength:50>
  access_code? string<trim|length:6>
}`;

const parsedRetrieveCardSpec = validator.parse(retrieveCardSpec);

async function retrieveCard(serviceData) {
  const data = validator.validate(serviceData, parsedRetrieveCardSpec);
  let result;

  const card = await CreatorCard.findOne({ query: { slug: data.slug } });

  if (!card) {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.NF01);
  }

  if (card.status === 'draft') {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.NF02);
  }

  if (card.access_type === 'private' && !data.access_code) {
    throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED_FOR_VIEW, ERROR_CODE.AC03);
  }

  if (card.access_type === 'private' && data.access_code !== card.access_code) {
    throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE, ERROR_CODE.AC04);
  }

  result = serializeCard(card);

  return result;
}

module.exports = retrieveCard;
