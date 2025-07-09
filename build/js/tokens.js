/**
 * Design Tokens - JavaScript ES6
 * Generated from DTCG format tokens
 * Do not edit directly, update tokens in Figma Token Studio
 */

export const tokens = {
  "global": {
    "colors": {
      "primary": {
        "50": {
          "value": "#eff6ff",
          "type": "color",
          "description": "Primary color - lightest shade"
        },
        "500": {
          "value": "#3b82f6",
          "type": "color",
          "description": "Primary color - base shade"
        },
        "900": {
          "value": "#1e3a8a",
          "type": "color",
          "description": "Primary color - darkest shade"
        }
      },
      "slate": {
        "600": {
          "value": "#475569",
          "type": "color",
          "description": "Slate color - 600 shade"
        },
        "900": {
          "value": "#0f172a",
          "type": "color",
          "description": "Slate color - 900 shade"
        }
      },
      "text": {
        "primary": {
          "value": "#0f172a",
          "type": "color",
          "description": "Primary text color"
        },
        "secondary": {
          "value": "#475569",
          "type": "color",
          "description": "Secondary text color"
        }
      }
    },
    "spacing": {
      "xs": {
        "value": "4px",
        "type": "dimension",
        "description": "Extra small spacing"
      },
      "sm": {
        "value": "8px",
        "type": "dimension",
        "description": "Small spacing"
      },
      "md": {
        "value": "16px",
        "type": "dimension",
        "description": "Medium spacing"
      },
      "lg": {
        "value": "24px",
        "type": "dimension",
        "description": "Large spacing"
      },
      "xl": {
        "value": "32px",
        "type": "dimension",
        "description": "Extra large spacing"
      }
    },
    "typography": {
      "fontSize": {
        "xs": {
          "value": "12px",
          "type": "dimension",
          "description": "Extra small font size"
        },
        "sm": {
          "value": "14px",
          "type": "dimension",
          "description": "Small font size"
        },
        "base": {
          "value": "16px",
          "type": "dimension",
          "description": "Base font size"
        },
        "lg": {
          "value": "18px",
          "type": "dimension",
          "description": "Large font size"
        },
        "xl": {
          "value": "20px",
          "type": "dimension",
          "description": "Extra large font size"
        }
      },
      "fontWeight": {
        "normal": {
          "value": 400,
          "type": "fontWeight",
          "description": "Normal font weight"
        },
        "medium": {
          "value": 500,
          "type": "fontWeight",
          "description": "Medium font weight"
        },
        "semibold": {
          "value": 600,
          "type": "fontWeight",
          "description": "Semibold font weight"
        },
        "bold": {
          "value": 700,
          "type": "fontWeight",
          "description": "Bold font weight"
        }
      }
    }
  }
};

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
};