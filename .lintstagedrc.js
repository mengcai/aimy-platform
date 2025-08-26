module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'biome format --write',
    'biome check --write',
  ],
  '*.{json,md,yml,yaml}': ['biome format --write'],
};
