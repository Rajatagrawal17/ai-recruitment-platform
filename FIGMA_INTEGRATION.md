# Figma Design System Integration

## Setup Guide

This document explains how to set up automatic token syncing from Figma to your codebase.

## Method 1: Figma Tokens Plugin (Recommended)

### Installation

1. Open your Figma design file
2. Go to **Plugins** → **Browse plugins**
3. Search for "Figma Tokens"
4. Click **Install**
5. Open the plugin: **Plugins** → **Figma Tokens**

### Configuration

1. **Create Token Groups** in the plugin:
   - Colors
   - Typography
   - Spacing
   - Shadows
   - Border Radius

2. **Export Tokens**:
   - In Figma Tokens plugin → **Settings**
   - Select **Export** → **JSON**
   - Copy the JSON output

3. **Update Your Repository**:
   - Paste exported JSON into `frontend/src/tokens/design-tokens.json`
   - Commit the changes

### Auto-Sync with GitHub (Optional)

Create a GitHub Actions workflow:

```yaml
# .github/workflows/figma-sync.yml
name: Sync Figma Tokens

on:
  workflow_dispatch:  # Manual trigger

jobs:
  sync-tokens:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Fetch Figma Tokens
        run: |
          # This requires Figma API setup
          # For now, manually export and commit
          echo "Run Figma Tokens export manually"
```

## Method 2: Figma REST API

### Get Your Credentials

1. Go to [Figma Settings](https://www.figma.com/settings)
2. Create a **Personal access token**
3. Copy the token (keep it secret!)
4. Get your **File ID** from the Figma URL:
   ```
   https://www.figma.com/file/{FILE_ID}/...
   ```

### Setup Script

Create `scripts/sync-figma-tokens.js`:

```javascript
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;

async function syncFigmaTokens() {
  if (!FIGMA_TOKEN || !FIGMA_FILE_ID) {
    console.error('Missing FIGMA_TOKEN or FIGMA_FILE_ID environment variables');
    process.exit(1);
  }

  try {
    // Fetch file from Figma API
    const response = await fetch(
      `https://api.figma.com/v1/files/${FIGMA_FILE_ID}`,
      {
        headers: {
          'X-Figma-Token': FIGMA_TOKEN,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract tokens from components/variables
    // This depends on your Figma structure
    const tokens = parseTokensFromFigma(data);

    // Write to file
    const tokensPath = path.join(
      __dirname,
      '../frontend/src/tokens/design-tokens.json'
    );

    fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
    console.log('✅ Tokens synced successfully!');

  } catch (error) {
    console.error('❌ Failed to sync tokens:', error);
    process.exit(1);
  }
}

function parseTokensFromFigma(figmaFile) {
  // Custom logic to parse your Figma structure
  // This is a placeholder - adapt to your design system
  return {
    colors: {},
    typography: {},
    spacing: {},
  };
}

syncFigmaTokens();
```

### Environment Setup

Add to `.env`:
```
FIGMA_TOKEN=your_personal_access_token_here
FIGMA_FILE_ID=your_file_id_here
```

Add to `.gitignore`:
```
.env
.env.local
```

### Run the Sync

```bash
npm run sync-tokens
```

## Method 3: Manual Workflow (Simplest)

If you prefer to keep it simple:

1. **Monthly Sync**: Export tokens from Figma
2. **Update JSON**: Replace `design-tokens.json`
3. **Test**: Verify all components look correct
4. **Commit**: Push changes to dev branch
5. **Review**: Get design approval
6. **Merge**: Merge to main

### Export Steps:

1. In Figma Tokens plugin
2. Click **Settings** → **Export Token Set**
3. Copy the JSON
4. Paste into `design-tokens.json`
5. Commit and push

## Update CSS Custom Properties

After updating tokens, regenerate CSS if needed:

```bash
npm run build:tokens
```

(Note: Currently CSS is manually maintained, but can be automated)

## Workflow Example

### Designer Does:
1. Updates colors/typography in Figma
2. Exports tokens from Figma Tokens plugin
3. Posts JSON in PR comment

### Developer Does:
1. Updates `design-tokens.json`
2. Tests components in dev environment
3. Runs tests
4. Commits and merges

## Troubleshooting

**Issue**: Tokens not reflecting in components
- **Solution**: Make sure to import latest CSS or rebuild

**Issue**: Color values different from Figma
- **Solution**: Check export format matches JSON structure

**Issue**: Missing token categories
- **Solution**: Create missing groups in Figma Tokens plugin

## Next Steps

1. Create your Figma design file (if not exists)
2. Set up Figma Tokens plugin
3. Define token groups matching your `design-tokens.json`
4. Test the export/import process
5. Add to team workflow docs

## Resources

- [Figma Tokens Plugin](https://tokens.studio/)
- [Figma API Docs](https://www.figma.com/developers/api)
- [Design Tokens Best Practices](https://design-tokens.github.io/)

---

**Current Setup**: Manual JSON updates recommended for simplicity
**Recommended**: Automate with GitHub Actions once settled
