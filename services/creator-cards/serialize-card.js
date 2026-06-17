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
      links: card.links || [],
      service_rates: card.service_rates,
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
