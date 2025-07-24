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
        // Skip metadata keys
        if (key.startsWith('$')) continue;
        
        if (value && typeof value === 'object') {
          if (value.$value !== undefined) {
            // This is a DTCG token
            result[key] = {
              value: value.$value,
              type: value.$type,
              description: value.$description,
              attributes: {
                category: path[0] || 'token',
                type: path[1] || 'default',
                item: path[2] || key
              }
            };
          } else {
            // This is a group, recurse
            const nested = transformDTCG(value, [...path, key]);
            // Only add if it has content
            if (Object.keys(nested).length > 0) {
              result[key] = nested;
            }
          }
        }
      }
      
      return result;
    }
    
    // Start from the 'svds' key if it exists, otherwise use the whole object
    const tokens = data.svds || data;
    const transformed = transformDTCG(tokens);
    
    console.log('Parsed tokens:', Object.keys(transformed));
    
    return transformed;
  }
});

// Custom name transforms
StyleDictionary.registerTransform({
  name: 'name/cti/kebab',
  type: 'name',
  transformer: function(token) {
    return token.path.join('-').toLowerCase().replace(/\s+/g, '-');
  }
});

StyleDictionary.registerTransform({
  name: 'name/cti/camel',
  type: 'name',
  transformer: function(token) {
    return token.path.map((part, index) => 
      index === 0 ? part.toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    ).join('').replace(/\s+/g, '');
  }
});

// Color transforms
StyleDictionary.registerTransform({
  name: 'dtcg/color/css',
  type: 'value',
  matcher: function(token) {
    return token.type === 'color';
  },
  transformer: function(token) {
    if (typeof token.value === 'string' && token.value.startsWith('{') && token.value.endsWith('}')) {
      return token.value;
    }
    return token.value;
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/color/hex',
  type: 'value',
  matcher: function(token) {
    return token.type === 'color';
  },
  transformer: function(token) {
    if (typeof token.value === 'string' && token.value.startsWith('#')) {
      return token.value.toUpperCase();
    }
    return token.value;
  }
});

// Font transforms
StyleDictionary.registerTransform({
  name: 'dtcg/fontSize/px',
  type: 'value',
  matcher: function(token) {
    return token.type === 'fontSizes';
  },
  transformer: function(token) {
    const value = parseFloat(token.value);
    return isNaN(value) ? token.value : value + 'px';
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/fontSize/rn',
  type: 'value',
  matcher: function(token) {
    return token.type === 'fontSizes';
  },
  transformer: function(token) {
    const value = parseFloat(token.value);
    return isNaN(value) ? token.value : value;
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/fontWeight/number',
  type: 'value',
  matcher: function(token) {
    return token.type === 'fontWeights';
  },
  transformer: function(token) {
    return parseInt(token.value, 10);
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/fontWeight/rn',
  type: 'value',
  matcher: function(token) {
    return token.type === 'fontWeights';
  },
  transformer: function(token) {
    const weight = parseInt(token.value, 10);
    const weightMap = {
      100: '100',
      200: '200',
      300: '300',
      400: 'normal',
      500: '500',
      600: '600',
      700: 'bold',
      800: '800',
      900: '900'
    };
    return weightMap[weight] || weight.toString();
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/fontFamily/css',
  type: 'value',
  matcher: function(token) {
    return token.type === 'fontFamilies';
  },
  transformer: function(token) {
    if (token.value.includes(' ') && !token.value.startsWith('"') && !token.value.startsWith("'")) {
      return '"' + token.value + '"';
    }
    return token.value;
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/fontFamily/rn',
  type: 'value',
  matcher: function(token) {
    return token.type === 'fontFamilies';
  },
  transformer: function(token) {
    // React Native doesn't need quotes around font family names
    return token.value.replace(/['"]/g, '');
  }
});

// Size and spacing transforms
StyleDictionary.registerTransform({
  name: 'dtcg/lineHeight/css',
  type: 'value',
  matcher: function(token) {
    return token.type === 'lineHeights';
  },
  transformer: function(token) {
    const value = parseFloat(token.value);
    return isNaN(value) ? token.value : value + 'px';
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/lineHeight/rn',
  type: 'value',
  matcher: function(token) {
    return token.type === 'lineHeights';
  },
  transformer: function(token) {
    const value = parseFloat(token.value);
    return isNaN(value) ? token.value : value;
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/spacing/px',
  type: 'value',
  matcher: function(token) {
    return token.type === 'spacing' || token.type === 'sizing';
  },
  transformer: function(token) {
    const value = parseFloat(token.value);
    return isNaN(value) ? token.value : value + 'px';
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/spacing/rn',
  type: 'value',
  matcher: function(token) {
    return token.type === 'spacing' || token.type === 'sizing';
  },
  transformer: function(token) {
    const value = parseFloat(token.value);
    return isNaN(value) ? token.value : value;
  }
});

// Border transforms
StyleDictionary.registerTransform({
  name: 'dtcg/borderWidth/px',
  type: 'value',
  matcher: function(token) {
    return token.type === 'borderWidth';
  },
  transformer: function(token) {
    const value = parseFloat(token.value);
    if (value === 0) return '0';
    return isNaN(value) ? token.value : value + 'px';
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/borderWidth/rn',
  type: 'value',
  matcher: function(token) {
    return token.type === 'borderWidth';
  },
  transformer: function(token) {
    const value = parseFloat(token.value);
    return isNaN(value) ? token.value : value;
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/borderRadius/px',
  type: 'value',
  matcher: function(token) {
    return token.type === 'borderRadius';
  },
  transformer: function(token) {
    if (token.value === 'full') return '9999px';
    const value = parseFloat(token.value);
    if (value === 0) return '0';
    return isNaN(value) ? token.value : value + 'px';
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/borderRadius/rn',
  type: 'value',
  matcher: function(token) {
    return token.type === 'borderRadius';
  },
  transformer: function(token) {
    if (token.value === 'full') return 9999;
    const value = parseFloat(token.value);
    return isNaN(value) ? token.value : value;
  }
});

// Shadow transforms
StyleDictionary.registerTransform({
  name: 'dtcg/boxShadow/css',
  type: 'value',
  matcher: function(token) {
    return token.type === 'boxShadow';
  },
  transformer: function(token) {
    const shadow = token.value;
    if (shadow.x === '0' && shadow.y === '0' && shadow.blur === '0' && shadow.spread === '0') {
      return 'none';
    }
    const x = shadow.x + 'px';
    const y = shadow.y + 'px';
    const blur = shadow.blur + 'px';
    const spread = shadow.spread ? shadow.spread + 'px' : '';
    const color = shadow.color;
    return [x, y, blur, spread, color].filter(Boolean).join(' ');
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/boxShadow/rn',
  type: 'value',
  matcher: function(token) {
    return token.type === 'boxShadow';
  },
  transformer: function(token) {
    const shadow = token.value;
    const shadowOffset = {
      width: parseFloat(shadow.x) || 0,
      height: parseFloat(shadow.y) || 0
    };
    const shadowRadius = parseFloat(shadow.blur) || 0;
    const shadowColor = shadow.color || '#000000';
    
    // Calculate elevation for Android
    const elevation = Math.max(
      Math.abs(shadowOffset.width),
      Math.abs(shadowOffset.height),
      shadowRadius
    );
    
    return {
      shadowOffset: shadowOffset,
      shadowRadius: shadowRadius,
      shadowColor: shadowColor,
      shadowOpacity: 1,
      elevation: elevation
    };
  }
});

// Typography transform
StyleDictionary.registerTransform({
  name: 'dtcg/typography/css',
  type: 'value',
  matcher: function(token) {
    return token.type === 'typography';
  },
  transformer: function(token) {
    const typography = token.value;
    const parts = [];
    
    if (typography.fontFamily) {
      const fontFamily = typography.fontFamily.startsWith('{') ? 
        typography.fontFamily : 
        (typography.fontFamily.includes(' ') ? '"' + typography.fontFamily + '"' : typography.fontFamily);
      parts.push('font-family: ' + fontFamily);
    }
    
    if (typography.fontWeight) {
      const fontWeight = typography.fontWeight.startsWith('{') ? 
        typography.fontWeight : 
        typography.fontWeight;
      parts.push('font-weight: ' + fontWeight);
    }
    
    if (typography.fontSize) {
      const fontSize = typography.fontSize.startsWith('{') ? 
        typography.fontSize : 
        typography.fontSize + 'px';
      parts.push('font-size: ' + fontSize);
    }
    
    if (typography.lineHeight) {
      const lineHeight = typography.lineHeight.startsWith('{') ? 
        typography.lineHeight : 
        typography.lineHeight + 'px';
      parts.push('line-height: ' + lineHeight);
    }
    
    if (typography.letterSpacing) {
      parts.push('letter-spacing: ' + typography.letterSpacing + 'px');
    }
    
    return parts.join('; ');
  }
});

// Number transform
StyleDictionary.registerTransform({
  name: 'dtcg/number/css',
  type: 'value',
  matcher: function(token) {
    return token.type === 'number';
  },
  transformer: function(token) {
    return token.value;
  }
});

// Transform groups
StyleDictionary.registerTransformGroup({
  name: 'dtcg/css',
  transforms: [
    'attribute/cti',
    'name/cti/kebab',
    'dtcg/color/css',
    'dtcg/fontSize/px',
    'dtcg/fontWeight/number',
    'dtcg/fontFamily/css',
    'dtcg/lineHeight/css',
    'dtcg/spacing/px',
    'dtcg/borderWidth/px',
    'dtcg/borderRadius/px',
    'dtcg/boxShadow/css',
    'dtcg/typography/css',
    'dtcg/number/css'
  ]
});

StyleDictionary.registerTransformGroup({
  name: 'dtcg/scss',
  transforms: [
    'attribute/cti',
    'name/cti/kebab',
    'dtcg/color/css',
    'dtcg/fontSize/px',
    'dtcg/fontWeight/number',
    'dtcg/fontFamily/css',
    'dtcg/lineHeight/css',
    'dtcg/spacing/px',
    'dtcg/borderWidth/px',
    'dtcg/borderRadius/px',
    'dtcg/boxShadow/css',
    'dtcg/typography/css',
    'dtcg/number/css'
  ]
});

StyleDictionary.registerTransformGroup({
  name: 'dtcg/react-native',
  transforms: [
    'attribute/cti',
    'name/cti/camel',
    'dtcg/color/hex',
    'dtcg/fontSize/rn',
    'dtcg/fontWeight/rn',
    'dtcg/fontFamily/rn',
    'dtcg/lineHeight/rn',
    'dtcg/spacing/rn',
    'dtcg/borderWidth/rn',
    'dtcg/borderRadius/rn',
    'dtcg/boxShadow/rn',
    'dtcg/number/css'
  ]
});

StyleDictionary.registerTransformGroup({
  name: 'dtcg/js',
  transforms: [
    'attribute/cti',
    'name/cti/camel',
    'dtcg/color/css',
    'dtcg/fontSize/px',
    'dtcg/fontWeight/number',
    'dtcg/fontFamily/css',
    'dtcg/lineHeight/css',
    'dtcg/spacing/px',
    'dtcg/borderRadius/px',
    'dtcg/borderWidth/px',
    'dtcg/boxShadow/css'
  ]
});

// Custom formats
StyleDictionary.registerFormat({
  name: 'css/variables-dtcg',
  formatter: function(dictionary, config) {
    const header = '/**\n * Design Tokens - CSS Variables\n * Generated from DTCG format tokens\n * Do not edit directly\n */\n\n';
    
    const variables = dictionary.allTokens.map(token => {
      const comment = token.description ? '  /* ' + token.description + ' */\n' : '';
      return comment + '  --' + token.name + ': ' + token.value + ';';
    }).join('\n');
    
    return header + ':root {\n' + variables + '\n}';
  }
});

StyleDictionary.registerFormat({
  name: 'scss/variables-dtcg',
  formatter: function(dictionary, config) {
    const header = '/**\n * Design Tokens - SCSS Variables\n * Generated from DTCG format tokens\n * Do not edit directly\n */\n\n';
    
    const variables = dictionary.allTokens.map(token => {
      const comment = token.description ? '// ' + token.description + '\n' : '';
      return comment + '$' + token.name + ': ' + token.value + ';';
    }).join('\n');
    
    return header + variables;
  }
});

StyleDictionary.registerFormat({
  name: 'javascript/react-native',
  formatter: function(dictionary, config) {
    const header = '/**\n * Design Tokens - React Native\n * Generated from DTCG format tokens\n * Do not edit directly\n */\n\n';
    
    // Group tokens by category for better organization
    const groupedTokens = {};
    dictionary.allTokens.forEach(token => {
      const category = token.attributes.category;
      if (!groupedTokens[category]) {
        groupedTokens[category] = {};
      }
      groupedTokens[category][token.name] = token.value;
    });
    
    let output = header;
    
    // Convert grouped tokens to nested object structure
    const allTokens = {};
    Object.keys(groupedTokens).forEach(category => {
      allTokens[category] = groupedTokens[category];
    });
    
    output += 'export const tokens = ' + JSON.stringify(allTokens, null, 2) + ';\n\n';
    output += 'export default tokens;';
    
    return output;
  }
});

StyleDictionary.registerFormat({
  name: 'javascript/es6',
  formatter: function(dictionary, config) {
    const header = '/**\n * Design Tokens - JavaScript ES6\n * Generated from DTCG format tokens\n * Do not edit directly\n */\n\n';
    
    const tokens = dictionary.allTokens.map(token => {
      const comment = token.description ? '// ' + token.description + '\n' : '';
      return comment + 'export const ' + token.name + ' = \'' + token.value + '\';';
    }).join('\n');
    
    return header + tokens;
  }
});

// Default configuration for direct execution
const defaultConfig = {
  source: ['tokens/tokens.json'],
  platforms: {
    css: {
      transformGroup: 'dtcg/css',
      buildPath: 'build/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables-dtcg'
        }
      ]
    },
    scss: {
      transformGroup: 'dtcg/scss',
      buildPath: 'build/scss/',
      files: [
        {
          destination: 'variables.scss',
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
          format: 'javascript/es6'
        },
        {
          destination: 'tokens.json',
          format: 'json'
        }
      ]
    },
    reactNative: {
      transformGroup: 'dtcg/react-native',
      buildPath: 'build/react-native/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/react-native'
        }
      ]
    }
  }
};

// Export for npm package usage
module.exports = {
  StyleDictionary,
  config: defaultConfig
};

// Only run build if this is the main module (not imported)
if (require.main === module) {
  console.log('Building design tokens...');
  
  try {
    const sd = StyleDictionary.extend(defaultConfig);
    
    // Debug: Log token count
    console.log('Found ' + (sd.allTokens ? sd.allTokens.length : 0) + ' tokens');
    
    sd.buildAllPlatforms();
    console.log('Build complete!');
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

StyleDictionary.registerFormat({
  name: 'javascript/react-native',
  formatter: function(dictionary, config) {
    const header = '/**\n * Design Tokens - React Native\n * Generated from DTCG format tokens\n * Do not edit directly\n */\n\n';
    
    // Group tokens by category for better organization
    const groupedTokens = {};
    dictionary.allTokens.forEach(token => {
      const category = token.attributes.category;
      if (!groupedTokens[category]) {
        groupedTokens[category] = {};
      }
      groupedTokens[category][token.name] = token.value;
    });
    
    let output = header;
    
    // Export individual categories
    Object.keys(groupedTokens).forEach(category => {
      output += 'export const ' + category + ' = ' + JSON.stringify(groupedTokens[category], null, 2) + ';\n\n';
    });
    
    // Export all tokens as one object
    const allTokens = {};
    dictionary.allTokens.forEach(token => {
      allTokens[token.name] = token.value;
    });
    
    output += 'export const tokens = ' + JSON.stringify(allTokens, null, 2) + ';\n\n';
    output += 'export default tokens;';
    
    return output;
  }
});