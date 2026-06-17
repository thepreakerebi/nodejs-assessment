const { createHandler } = require('@app-core/server');
const createCardService = require('@app/services/creator-cards/create-card');
const { CreatorCardMessages } = require('@app/messages');

module.exports = createHandler({
  path: '/creator-cards',
  method: 'post',
  middlewares: [],
  async handler(rc, helpers) {
    const response = await createCardService(rc.body);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CreatorCardMessages.CREATED,
      data: response,
    };
  },
});
