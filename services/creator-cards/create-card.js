const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const CreatorCard = require('@app/repository/creator-card');
const { CreatorCardMessages } = require('@app/messages');
const assertCreatorCardRules = require('./assert-creator-card-rules');
const buildSlug = require('./build-slug');
const serializeCard = require('./serialize-card');

const createCardSpec = `root {
  title string<trim|minLength:3|maxLength:100>
  description? string<trim|maxLength:500>
  slug? string<trim|minLength:5|maxLength:50>
  creator_reference string<trim|length:20>
  links[]? {
    title string<trim|minLength:1|maxLength:100>
    url string<trim|maxLength:200>
  }
  service_rates? {
    currency string<trim|uppercase|isAnyOf:NGN,USD,GBP,GHS>
    rates[] {
      name string<trim|minLength:3|maxLength:100>
      description? string<trim|maxLength:250>
      amount number<min:1>
    }
  }
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<trim|length:6>
}`;

const parsedCreateCardSpec = validator.parse(createCardSpec);

async function resolveSlug(data) {
  let slug;
  let existingGeneratedSlug;
  let attempts = 0;

  if (data.slug) {
    const existingCard = await CreatorCard.findOne({ query: { slug: data.slug } });

    if (existingCard) {
      throwAppError(CreatorCardMessages.SLUG_ALREADY_TAKEN, ERROR_CODE.SL02);
    }

    slug = data.slug;
  } else {
    slug = buildSlug(data.title);

    existingGeneratedSlug = await CreatorCard.findOne({ query: { slug } });

    while (existingGeneratedSlug && attempts < 5) {
      slug = buildSlug(data.title, { forceSuffix: true });
      existingGeneratedSlug = await CreatorCard.findOne({ query: { slug } });
      attempts += 1;
    }

    if (existingGeneratedSlug) {
      throwAppError(CreatorCardMessages.SLUG_ALREADY_TAKEN, ERROR_CODE.SL02);
    }
  }

  return slug;
}

async function createCard(serviceData, options = {}) {
  const validatedData = validator.validate(serviceData, parsedCreateCardSpec);
  let result;

  validatedData.access_type = validatedData.access_type || 'public';
  validatedData.links = validatedData.links || [];

  assertCreatorCardRules(validatedData);

  validatedData.slug = await resolveSlug(validatedData);

  const createdCard = await CreatorCard.create(validatedData, options);

  result = serializeCard(createdCard, { includeAccessCode: true });

  return result;
}

module.exports = createCard;
