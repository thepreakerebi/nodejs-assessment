const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');

const modelName = 'creatorCards';

const linkSchema = {
  title: { type: SchemaTypes.String },
  url: { type: SchemaTypes.String },
};

const serviceRateSchema = {
  name: { type: SchemaTypes.String },
  description: { type: SchemaTypes.String },
  amount: { type: SchemaTypes.Number },
};

const schemaConfig = {
  _id: { type: SchemaTypes.ULID },
  title: { type: SchemaTypes.String },
  description: { type: SchemaTypes.String },
  slug: { type: SchemaTypes.String, unique: true, index: true },
  creator_reference: { type: SchemaTypes.String, index: true },
  links: { type: [linkSchema], default: [] },
  service_rates: {
    currency: { type: SchemaTypes.String },
    rates: { type: [serviceRateSchema], default: [] },
  },
  status: { type: SchemaTypes.String, index: true },
  access_type: { type: SchemaTypes.String, default: 'public' },
  access_code: { type: SchemaTypes.String, default: null },
  created: { type: SchemaTypes.Number },
  updated: { type: SchemaTypes.Number },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

module.exports = DatabaseModel.model(modelName, modelSchema, { paranoid: true });
