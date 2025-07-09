const StyleDictionary = require('style-dictionary');

// Custom transforms
StyleDictionary.registerTransform({
  name: 'name/cti/kebab',
  type: 'name',
  transformer: function(token) {
    return token.path.join('-').toLowerCase();
  }
});

StyleDictionary.registerTransform({
  name: 'size/px',
  type: 'value',
  matcher: function(token) {
    return token.type === 'spacing' || token.type === 'fontSizes';
  },
  transformer: function(token) {
    return parseFloat(token.value) + 'px';
  }
});

// Custom transform groups
StyleDictionary.registerTransformGroup({
  name: 'css/custom',
  transforms: [
    'attribute/cti',
    'name/cti/kebab',
    'size/px',
    'color/hex'
  ]
});

StyleDictionary.registerTransformGroup({
  name: 'js/custom',
  transforms: [
    'attribute/cti',
    'name/cti/camel',
    'size/px',
    'color/hex'
  ]
});

// Custom formats
StyleDictionary.registerFormat({
  name: 'css/variables',
  formatter: function(dictionary) {
    return `:root {
${dictionary.allTokens.map(token => 
  `  --${token.name}: ${token.value};`
).join('\n')}
}`;
  }
});

StyleDictionary.registerFormat({
  name: 'scss/variables',
  formatter: function(dictionary) {
    return dictionary.allTokens.map(token => 
      `$${token.name}: ${token.value};`
    ).join('\n');
  }
});

StyleDictionary.registerFormat({
  name: 'javascript/es6',
  formatter: function(dictionary) {
    return `export const tokens = ${JSON.stringify(dictionary.tokens, null, 2)};`;
  }
});

module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css/custom',
      buildPath: 'build/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables'
        },
        {
          destination: 'tokens.scss',
          format: 'scss/variables'
        }
      ]
    },
    js: {
      transformGroup: 'js/custom',
      buildPath: 'build/js/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6'
        },
        {
          destination: 'tokens.json',
          format: 'json'
        }
      ]
    }
  }
};