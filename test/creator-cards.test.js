const assert = require('assert');
const { MockModelStubs, MockModels } = require('@app/mock-models');
const createCard = require('@app/services/creator-cards/create-card');
const retrieveCard = require('@app/services/creator-cards/retrieve-card');
const deleteCard = require('@app/services/creator-cards/delete-card');

const creatorReference = 'crt_8f2k1m9x4p7w3q5z';

function configureCreatorCardStub(config) {
  return MockModelStubs.CreatorCard.configureStubs(config);
}

function assertAppError(error, code) {
  assert.strictEqual(error.isApplicationError, true);
  assert.strictEqual(error.errorCode, code);
}

describe('Creator Cards', () => {
  afterEach(() => {
    MockModelStubs.CreatorCard.findOne.default = function (configuration) {
      return MockModelStubs.CreatorCard.createDocument(configuration.query);
    };
  });

  it('creates a published public card with id and without _id', async () => {
    const findStub = configureCreatorCardStub({ method: 'findOne', mockNull: true });

    const card = await createCard({
      title: 'George Cooks',
      description: 'Weekly cooking podcast',
      slug: 'george-cooks',
      creator_reference: creatorReference,
      links: [{ title: 'YouTube', url: 'https://youtube.com/@georgecooks' }],
      service_rates: {
        currency: 'NGN',
        rates: [{ name: 'IG Story Post', description: 'One story mention', amount: 5000000 }],
      },
      status: 'published',
    });

    assert.strictEqual(typeof card.id, 'string');
    assert.strictEqual(card._id, undefined);
    assert.strictEqual(card.slug, 'george-cooks');
    assert.strictEqual(card.access_type, 'public');
    assert.strictEqual(card.access_code, null);

    findStub.revert();
  });

  it('auto-generates slugs from titles', async () => {
    const findStub = configureCreatorCardStub({ method: 'findOne', mockNull: true });

    const card = await createCard({
      title: 'Ada Designs Things',
      creator_reference: 'crt_a1b2c3d4e5f6g7h8',
      status: 'published',
    });

    assert.strictEqual(card.slug, 'ada-designs-things');

    findStub.revert();
  });

  it('rejects duplicate client-provided slugs with SL02', async () => {
    const findStub = configureCreatorCardStub({
      method: 'findOne',
      docConfig: { slug: 'george-cooks' },
    });

    await assert.rejects(
      () =>
        createCard({
          title: 'Another George',
          slug: 'george-cooks',
          creator_reference: 'crt_m1n2b3v4c5x6z7l8',
          status: 'published',
        }),
      (error) => {
        assertAppError(error, 'SL02');
        return true;
      }
    );

    findStub.revert();
  });

  it('requires access_code for private cards', async () => {
    await assert.rejects(
      () =>
        createCard({
          title: 'Secret Card',
          creator_reference: 'crt_q1w2e3r4t5y6u7i8',
          status: 'published',
          access_type: 'private',
        }),
      (error) => {
        assertAppError(error, 'AC01');
        return true;
      }
    );
  });

  it('rejects access_code on public cards', async () => {
    await assert.rejects(
      () =>
        createCard({
          title: 'Public Card',
          creator_reference: 'crt_q1w2e3r4t5y6u7i8',
          status: 'published',
          access_type: 'public',
          access_code: 'A1B2C3',
        }),
      (error) => {
        assertAppError(error, 'AC05');
        return true;
      }
    );
  });

  it('retrieves published public cards without leaking access_code', async () => {
    const findStub = configureCreatorCardStub({
      method: 'findOne',
      docConfig: { status: 'published', access_type: 'public', access_code: 'A1B2C3' },
    });

    const card = await retrieveCard({ slug: 'george-cooks' });

    assert.strictEqual(card.slug, 'george-cooks');
    assert.strictEqual(Object.hasOwn(card, 'access_code'), false);
    assert.strictEqual(card._id, undefined);

    findStub.revert();
  });

  it('returns NF01 for missing cards', async () => {
    const findStub = configureCreatorCardStub({ method: 'findOne', mockNull: true });

    await assert.rejects(
      () => retrieveCard({ slug: 'missing-card' }),
      (error) => {
        assertAppError(error, 'NF01');
        return true;
      }
    );

    findStub.revert();
  });

  it('returns NF02 for draft cards', async () => {
    const findStub = configureCreatorCardStub({
      method: 'findOne',
      docConfig: { status: 'draft', access_type: 'public' },
    });

    await assert.rejects(
      () => retrieveCard({ slug: 'draft-card' }),
      (error) => {
        assertAppError(error, 'NF02');
        return true;
      }
    );

    findStub.revert();
  });

  it('requires access code for private retrieval', async () => {
    const findStub = configureCreatorCardStub({
      method: 'findOne',
      docConfig: { status: 'published', access_type: 'private', access_code: 'A1B2C3' },
    });

    await assert.rejects(
      () => retrieveCard({ slug: 'vip-rate-card' }),
      (error) => {
        assertAppError(error, 'AC03');
        return true;
      }
    );

    findStub.revert();
  });

  it('rejects invalid private access code', async () => {
    const findStub = configureCreatorCardStub({
      method: 'findOne',
      docConfig: { status: 'published', access_type: 'private', access_code: 'A1B2C3' },
    });

    await assert.rejects(
      () => retrieveCard({ slug: 'vip-rate-card', access_code: 'WRONG1' }),
      (error) => {
        assertAppError(error, 'AC04');
        return true;
      }
    );

    findStub.revert();
  });

  it('deletes active cards and returns the deleted card shape', async () => {
    const findStub = configureCreatorCardStub({
      method: 'findOne',
      docConfig: { status: 'published', access_type: 'public', access_code: null },
    });

    MockModels.CreatorCard.findOneAndUpdate = async (query, update) =>
      MockModelStubs.CreatorCard.createDocument({
        ...query,
        ...update,
        title: 'Ada Designs Things',
        creator_reference: 'crt_a1b2c3d4e5f6g7h8',
        status: 'published',
        access_type: 'public',
        access_code: null,
      });

    const card = await deleteCard({
      slug: 'ada-designs-things',
      creator_reference: 'crt_a1b2c3d4e5f6g7h8',
    });

    assert.strictEqual(card.slug, 'ada-designs-things');
    assert.strictEqual(typeof card.deleted, 'number');
    assert.strictEqual(card.access_code, null);
    assert.strictEqual(card._id, undefined);

    findStub.revert();
  });
});
