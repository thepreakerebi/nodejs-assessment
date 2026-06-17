function serializeLinks(links) {
  const linkList = Array.isArray(links) ? links : [];

  return linkList.map((link) => ({
    title: link.title,
    url: link.url,
  }));
}

function serializeServiceRates(serviceRates) {
  let response;

  if (!serviceRates) {
    response = serviceRates;
  } else {
    response = {
      currency: serviceRates.currency,
      rates: (Array.isArray(serviceRates.rates) ? serviceRates.rates : []).map((rate) => ({
        name: rate.name,
        description: rate.description,
        amount: rate.amount,
      })),
    };
  }

  return response;
}

function serializeCard(card, options = {}) {
  let response;
  const includeAccessCode = !!options.includeAccessCode;

  if (!card) {
    response = null;
  } else {
    response = {
      id: card._id,
      title: card.title,
      description: card.description,
      slug: card.slug,
      creator_reference: card.creator_reference,
      links: serializeLinks(card.links),
      service_rates: serializeServiceRates(card.service_rates),
      status: card.status,
      access_type: card.access_type || 'public',
      created: card.created,
      updated: card.updated,
      deleted: card.deleted || null,
    };

    if (includeAccessCode) {
      response.access_code = card.access_code || null;
    }
  }

  return response;
}

module.exports = serializeCard;
