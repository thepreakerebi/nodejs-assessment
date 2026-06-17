const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const CreatorCard = require('@app/repository/creator-card');
const { CreatorCardMessages } = require('@app/messages');
const serializeCard = require('./serialize-card');

const deleteCardSpec = `root {
  slug string<trim|minLength:5|maxLength:50>
  creator_reference string<trim|length:20>
}`;

const parsedDeleteCardSpec = validator.parse(deleteCardSpec);

async function deleteCard(serviceData) {
  const data = validator.validate(serviceData, parsedDeleteCardSpec);
  let result;

  const card = await CreatorCard.findOne({ query: { slug: data.slug } });

  if (!card) {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.NF01);
  }

  const deletedAt = Date.now();
  const updatedCard = await CreatorCard.raw().findOneAndUpdate(
    { slug: data.slug, deleted: 0 },
    { deleted: deletedAt, updated: deletedAt },
    { new: true, lean: true }
  );

  if (!updatedCard) {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.NF01);
  }

  result = serializeCard(updatedCard, { includeAccessCode: true });

  return result;
}

module.exports = deleteCard;
