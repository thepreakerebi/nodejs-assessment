const { createHandler } = require('@app-core/server');
const retrieveCardService = require('@app/services/creator-cards/retrieve-card');
const { CreatorCardMessages } = require('@app/messages');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  middlewares: [],
  async handler(rc, helpers) {
    const response = await retrieveCardService({
      ...rc.query,
      slug: rc.params.slug,
    });

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CreatorCardMessages.RETRIEVED,
      data: response,
    };
  },
});
