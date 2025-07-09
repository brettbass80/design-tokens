const StyleDictionary = require('style-dictionary');

// DTCG Parser - handles W3C DTCG format tokens
StyleDictionary.registerParser({
  pattern: /\.json$/,
  parse: ({ contents, filePath }) => {
    const data = JSON.parse(contents);
    
    // Transform DTCG format to Style Dictionary format
    function transformDTCG(obj, path = []) {
      const result = {};
      
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object') {
          if (value.$value !== undefined) {
            // This is a DTCG token
            result[key] = {
              value: value.$value,
              type: value.$type,
              description: value.$description,
              path: [...path, key],
              filePath
            };
          } else {
            // This is a group, recurse
            result[key] = transformDTCG(value, [...path, key]);
          }
        }
      }
      
      return result;
    }
    
    return transformDTCG(data);
  }
});

// Custom transforms for DTCG types
StyleDictionary.registerTransform({
  name: 'name/cti/kebab',
  type: 'name',
  transformer: function(token) {
    return token.path.join('-').toLowerCase();
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/size/px',
  type: 'value',
  matcher: function(token) {
    return token.type === 'dimension';
  },
  transformer: function(token) {
    const value = parseFloat(token.value);
    return isNaN(value) ? token.value : value + 'px';
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/color/hex',
  type: 'value',
  matcher: function(token) {
    return token.type === 'color';
  },
  transformer: function(token) {
    // Handle references like {colors.primary.500}
    if (typeof token.value === 'string' && token.value.startsWith('{') && token.value.endsWith('}')) {
      return token.value; // Let Style Dictionary resolve the reference
    }
    return token.value;
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/fontWeight/number',
  type: 'value',
  matcher: function(token) {
    return token.type === 'fontWeight';
  },
  transformer: function(token) {
    return parseInt(token.value);
  }
});

// Custom transform groups for DTCG
StyleDictionary.registerTransformGroup({
  name: 'dtcg/css',
  transforms: [
    'attribute/cti',
    'name/cti/kebab',
    'dtcg/size/px',
    'dtcg/color/hex',
    'dtcg/fontWeight/number'
  ]
});

StyleDictionary.registerTransformGroup({
  name: 'dtcg/js',
  transforms: [
    'attribute/cti',
    'name/cti/camel',
    'dtcg/size/px',
    'dtcg/color/hex',
    'dtcg/fontWeight/number'
  ]
});

// Enhanced formats with DTCG metadata
StyleDictionary.registerFormat({
  name: 'css/variables-dtcg',
  formatter: function(dictionary, config) {
    const header = `/**
 * Design Tokens - CSS Variables
 * Generated from DTCG format tokens
 * Do not edit directly, update tokens in Figma Token Studio
 */\n\n`;
    
    const variables = dictionary.allTokens.map(token => {
      const comment = token.description ? `  /* ${token.description} */\n` : '';
      return `${comment}  --${token.name}: ${token.value};`;
    }).join('\n');
    
    return `${header}:root {\n${variables}\n}`;
  }
});

StyleDictionary.registerFormat({
  name: 'scss/variables-dtcg',
  formatter: function(dictionary, config) {
    const header = `/**
 * Design Tokens - SCSS Variables
 * Generated from DTCG format tokens
 * Do not edit directly, update tokens in Figma Token Studio
 */\n\n`;
    
    const variables = dictionary.allTokens.map(token => {
      const comment = token.description ? `// ${token.description}\n` : '';
      return `${comment}${token.name}: ${token.value};`;
    }).join('\n');
    
    return header + variables;
  }
});

StyleDictionary.registerFormat({
  name: 'javascript/es6-dtcg',
  formatter: function(dictionary, config) {
    const header = `/**
 * Design Tokens - JavaScript ES6
 * Generated from DTCG format tokens
 * Do not edit directly, update tokens in Figma Token Studio
 */\n\n`;
    
    // Create nested object structure
    function buildNestedTokens(tokens) {
      const result = {};
      
      tokens.forEach(token => {
        let current = result;
        const path = token.path;
        
        // Navigate to the parent object
        for (let i = 0; i < path.length - 1; i++) {
          if (!current[path[i]]) {
            current[path[i]] = {};
          }
          current = current[path[i]];
        }
        
        // Set the final value
        current[path[path.length - 1]] = {
          value: token.value,
          type: token.type,
          ...(token.description && { description: token.description })
        };
      });
      
      return result;
    }
    
    const nestedTokens = buildNestedTokens(dictionary.allTokens);
    
    return `${header}export const tokens = ${JSON.stringify(nestedTokens, null, 2)};

// Utility function to get token values
export const getTokenValue = (path) => {
  const keys = path.split('.');
  let current = tokens;
  
  for (const key of keys) {
    if (current[key]) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  
  return current.value || current;
};`;
  }
});

module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'dtcg/css',
      buildPath: 'build/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables-dtcg'
        },
        {
          destination: 'tokens.scss',
          format: 'scss/variables-dtcg'
        }
      ]
    },
    js: {
      transformGroup: 'dtcg/js',
      buildPath: 'build/js/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6-dtcg'
        },
        {
          destination: 'tokens.json',
          format: 'json'
        }
      ]
    }
  }
};