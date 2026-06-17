const { randomBytes } = require('@app-core/randomness');

function buildSuffix() {
  const rawSuffix = randomBytes(6).toLowerCase();
  return rawSuffix.slice(0, 6);
}

function normalizeTitleSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');
}

function buildSlug(title, options = {}) {
  let slug = normalizeTitleSlug(title);

  if (slug.length < 5 || options.forceSuffix) {
    slug = `${slug || 'card'}-${buildSuffix()}`;
  }

  return slug;
}

module.exports = buildSlug;
