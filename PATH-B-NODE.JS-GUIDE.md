# Path B: Node.js Implementation Guide
**GraphQL + Theme Schema with Node.js (FEB 10-14)**

---

## 🎯 What We're Building

1. **Node.js GraphQL Script** — Updates 6 Shopify products with artist narratives
2. **Theme Schema Injection** — Auto-inject Person + Product schema markup
3. **Proper Node.js project structure** — Foundation for future Shopify work

---

## 🚀 FEB 10 Morning: Setup (1 hour)

### **Step 1: Create Shopify App Project**

```bash
cd ~/Desktop/madhudson-seo-project

# Create new Shopify app with Node.js scaffold
npm init @shopify/app@latest -- --name "madhudson-phase1" --type "cli"
```

This creates a full Node.js project with:
- Package.json (dependencies)
- Example code structure
- Shopify API client pre-configured
- Environment setup

### **Step 2: Install Dependencies**

```bash
cd madhudson-phase1

# Install additional packages you'll need
npm install dotenv chalk inquirer
```

This adds:
- `dotenv` — Load `.env` credentials
- `chalk` — Colored terminal output
- `inquirer` — Interactive prompts (optional but nice)

### **Step 3: Generate API Credentials**

```bash
npm run shopify app generate-credentials
```

This will:
1. Create custom app in your store
2. Generate access token
3. Save to `.env` automatically

**Output example:**
```
✓ Created custom app: madhudson-phase1
✓ API credentials saved to .env

SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
SHOPIFY_SHOP=madhudson.myshopify.com
```

### **Step 4: Verify Connection**

```bash
npm run shopify api query '{shop {name}}'
```

**Success:** Returns your store name ✅

---

## 💻 FEB 10-11: Build GraphQL Script (6-8 hours)

### **Step 1: Create Script File**

```bash
mkdir -p src/commands
touch src/commands/update-products.js
```

### **Step 2: Write the Script**

**File:** `src/commands/update-products.js`

```javascript
#!/usr/bin/env node

/**
 * Mad Hudson Phase 1: Shopify Product Update via GraphQL
 * Updates 6 products with artist narratives + metadata
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { createAdminApiClient } = require('@shopify/admin-api-client');

// Load environment variables
require('dotenv').config();

const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP;

if (!SHOPIFY_ACCESS_TOKEN || !SHOPIFY_SHOP) {
  console.error(chalk.red('ERROR: SHOPIFY_ACCESS_TOKEN and SHOPIFY_SHOP required in .env'));
  process.exit(1);
}

// Initialize Shopify Admin API client
const adminClient = createAdminApiClient({
  accessToken: SHOPIFY_ACCESS_TOKEN,
  storeDomain: SHOPIFY_SHOP,
  apiVersion: '2024-01',
});

/**
 * Get Shopify product ID by handle
 */
async function getProductId(handle) {
  const query = `
    {
      products(first: 1, query: "handle:${handle}") {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `;

  try {
    const response = await adminClient.graphql(query);
    const data = response.data;

    if (data.errors) {
      console.error(chalk.red(`ERROR fetching product ${handle}:`), data.errors);
      return null;
    }

    const products = data.products?.edges || [];
    if (products.length > 0) {
      return products[0].node.id;
    }
    return null;
  } catch (error) {
    console.error(chalk.red(`ERROR: ${error.message}`));
    return null;
  }
}

/**
 * Update Shopify product via GraphQL
 */
async function updateProduct(productId, productData) {
  const mutation = `
    mutation UpdateProduct($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          handle
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      id: productId,
      title: productData.title,
      bodyHtml: productData.body_html,
      metafields: [
        {
          namespace: 'custom',
          key: 'meta_description',
          value: productData.meta_description,
          type: 'single_line_text',
        },
        {
          namespace: 'custom',
          key: 'artist_name',
          value: productData.artist_name,
          type: 'single_line_text',
        },
        {
          namespace: 'custom',
          key: 'artist_bio',
          value: productData.artist_bio,
          type: 'multi_line_text',
        },
      ],
    },
  };

  try {
    const response = await adminClient.graphql(mutation, { variables });
    const data = response.data;

    if (data.errors) {
      console.error(chalk.red('ERROR updating product:'), data.errors);
      return false;
    }

    const userErrors = data.productUpdate?.userErrors || [];
    if (userErrors.length > 0) {
      console.error(chalk.red('ERROR:'), userErrors);
      return false;
    }

    return true;
  } catch (error) {
    console.error(chalk.red(`ERROR: ${error.message}`));
    return false;
  }
}

/**
 * Load products from JSON file
 */
function loadProductsJson(filepath) {
  try {
    const data = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(chalk.red(`ERROR loading ${filepath}:`), error.message);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  const productsFile = path.join(__dirname, '..', '..', 'products-to-update.json');

  if (!fs.existsSync(productsFile)) {
    console.error(chalk.red(`ERROR: ${productsFile} not found`));
    console.log('Create this file with product data first');
    process.exit(1);
  }

  const products = loadProductsJson(productsFile);
  if (!products) {
    process.exit(1);
  }

  console.log(chalk.cyan.bold('\n' + '='.repeat(70)));
  console.log(chalk.cyan.bold('Mad Hudson Phase 1: Shopify Product Update'));
  console.log(chalk.cyan.bold('='.repeat(70)));
  console.log(chalk.cyan(`Store: ${SHOPIFY_SHOP}`));
  console.log(chalk.cyan(`Products to update: ${products.length}`));
  console.log(chalk.cyan.bold('='.repeat(70) + '\n'));

  let updated = 0;
  let failed = 0;

  for (const productData of products) {
    const handle = productData.handle;
    process.stdout.write(`Processing: ${handle}... `);

    // Get product ID
    const productId = await getProductId(handle);
    if (!productId) {
      console.log(chalk.red('❌ FAILED (product not found)'));
      failed++;
      continue;
    }

    // Update product
    const success = await updateProduct(productId, productData);
    if (success) {
      console.log(chalk.green('✅ UPDATED'));
      updated++;
    } else {
      console.log(chalk.red('❌ FAILED'));
      failed++;
    }

    // Rate limiting: 500ms between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('\n' + chalk.cyan.bold('='.repeat(70)));
  console.log(chalk.cyan(`Results: ${chalk.green(updated)} updated, ${chalk.red(failed)} failed`));
  console.log(chalk.cyan.bold('='.repeat(70) + '\n'));

  if (failed > 0) {
    console.log(chalk.yellow('⚠️  Some products failed. Review errors above.'));
    process.exit(1);
  } else {
    console.log(chalk.green('✅ All products updated successfully!'));
    process.exit(0);
  }
}

// Run the script
main().catch((error) => {
  console.error(chalk.red('FATAL ERROR:'), error);
  process.exit(1);
});
```

### **Step 3: Add Script to package.json**

**File:** `package.json`

Find the `"scripts"` section and add:

```json
{
  "scripts": {
    "start": "node src/index.js",
    "update-products": "node src/commands/update-products.js",
    "shopify": "shopify"
  }
}
```

### **Step 4: Create Products JSON File**

**File:** `products-to-update.json` (in root of project)

```json
[
  {
    "handle": "eddie-watch",
    "title": "Brad Podray × Eddie Watch | Limited Edition Artist Collaboration",
    "body_html": "<h2>The Artist Behind Eddie Watch</h2><p><strong>Brad Podray</strong> is a visual artist... [full 500-1000 word narrative]</p>",
    "meta_description": "Brad Podray's Eddie Watch: Artist-designed, limited edition pre-order collaboration with Mad Hudson.",
    "artist_name": "Brad Podray",
    "artist_bio": "Brad Podray is a visual artist..."
  },
  {
    "handle": "marshall-watch",
    "title": "Bryce Wong × Marshall Watch | Limited Edition Artist Collaboration",
    "body_html": "...",
    "meta_description": "...",
    "artist_name": "...",
    "artist_bio": "..."
  }
  // ... 4 more products
]
```

---

## 🎨 FEB 12: Theme Schema Injection (3 hours)

Same as Python version — no changes needed.

**File:** Edit your Shopify theme's `product.liquid`

Add at the end:

```liquid
{% comment %} Schema Markup: Artist Collaboration Products {% endcomment %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{{ product.title }}",
  "description": "{{ product.description | strip_html | truncatewords: 30 }}",
  "image": "{{ product.featured_image | img_url: '600x600' }}",
  "brand": {
    "@type": "Brand",
    "name": "Mad Hudson"
  },
  "offers": {
    "@type": "Offer",
    "price": "{{ product.selected_or_first_available_variant.price | money_without_currency }}",
    "priceCurrency": "USD",
    "availability": "https://schema.org/PreOrder"
  },
  "creator": {
    "@type": "Person",
    "name": "{{ product.metafields.custom.artist_name.value | default: 'Artist Collaboration' }}",
    "description": "{{ product.metafields.custom.artist_bio.value | default: '' }}"
  }
}
</script>
```

Test: Go to product page, View Source, search for `"@type": "Product"` ✅

---

## ✅ FEB 13: Testing (2 hours)

### **Test on Staging (if available)**

```bash
# Update .env with staging credentials
# SHOPIFY_ACCESS_TOKEN=staging_token
# SHOPIFY_SHOP=madhudson-staging.myshopify.com

npm run update-products
```

### **Test on Production**

```bash
# Make sure .env has production credentials
npm run update-products
```

**Success output:**
```
======================================================================
Mad Hudson Phase 1: Shopify Product Update
======================================================================
Store: madhudson.myshopify.com
Products to update: 6
======================================================================

Processing: eddie-watch... ✅ UPDATED
Processing: marshall-watch... ✅ UPDATED
Processing: miami-watch... ✅ UPDATED
Processing: broken-time-watch... ✅ UPDATED
Processing: cd-watch... ✅ UPDATED
Processing: dogma-watch... ✅ UPDATED

======================================================================
Results: 6 updated, 0 failed
======================================================================

✅ All products updated successfully!
```

---

## 📋 FEB 14: Pre-Deployment Checklist (1 hour)

- [ ] `.env` has correct credentials
- [ ] Script runs without errors: `npm run update-products`
- [ ] All 6 products update successfully
- [ ] No API rate-limiting errors
- [ ] Schema markup validates in Google Schema Tester
- [ ] Products look good on live site

---

## 🚀 FEB 15: Deploy (15 minutes)

```bash
# Run the update script
npm run update-products

# Expected: All 6 products updated ✅
# Then: Verify in Shopify Admin + on live site
# Finally: Message SEO Monitor that Phase 1 is live
```

---

## 📁 Final Project Structure

```
madhudson-phase1/
├── .env (credentials)
├── .gitignore (includes .env)
├── package.json (dependencies + scripts)
├── products-to-update.json (6 products)
├── src/
│   └── commands/
│       └── update-products.js (GraphQL script)
└── [other Shopify app files]
```

---

## 🎯 Advantages of Node.js Approach

✅ **Proper project structure** — Foundation for future Shopify apps
✅ **Built-in Shopify client** — No need for manual API calls
✅ **Better error handling** — async/await syntax
✅ **Easier to extend** — Add more commands later (webhooks, etc.)
✅ **npm ecosystem** — Can add more packages as needed
✅ **Modern JavaScript** — ES6+, async/await, better tooling

---

## ⏱️ Updated Timeline (Node.js)

| Date | Task | Time |
|------|------|------|
| **FEB 10** | `npm init @shopify/app` + credentials | 1 hr |
| **FEB 10-11** | Build Node.js GraphQL script | 6 hrs |
| **FEB 12** | Theme schema injection | 3 hrs |
| **FEB 13** | Testing | 2 hrs |
| **FEB 14** | Verification | 1 hr |
| **FEB 15** | Deploy | 15 min |

**Total: 13.25 hours (same as Python, better structure)**

---

## 🚀 FEB 10 Morning: Quick Start

```bash
# 1. Create Shopify app
cd ~/Desktop/madhudson-seo-project
npm init @shopify/app@latest -- --name "madhudson-phase1" --type "cli"
cd madhudson-phase1

# 2. Install dependencies
npm install dotenv chalk inquirer

# 3. Generate credentials
npm run shopify app generate-credentials

# 4. Test connection
npm run shopify api query '{shop {name}}'

# ✅ Done! Ready for Step 2 (build GraphQL script)
```

---

## ✨ Why Node.js is Cool

- Modern async/await syntax
- Full Shopify app foundation
- Can build webhooks, API endpoints, etc. later
- npm ecosystem for extensions
- Professional project structure
- Easier to maintain and scale

---

**Ready to start with Node.js on FEB 10 morning?**
