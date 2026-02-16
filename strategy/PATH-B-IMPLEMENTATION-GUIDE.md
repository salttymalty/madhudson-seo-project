# Path B Implementation Guide
**Partial Integration: GraphQL + Theme Schema (14 hours, FEB 10-14)**

---

## 🎯 What Path B Includes

1. **GraphQL API Script** — Copywriter JSON → Shopify product updates (automates 45 min of manual work)
2. **Theme Schema Injection** — Artist data → Live Person + Product schema (automates 15 min of manual work)
3. **Testing Framework** — Validate both systems work on staging before production
4. **Rollback Plan** — Manual deployment instructions as backup if something breaks

**Not included:** SEO audit hooks, webhook notifications, versioning (nice-to-have, can add later)

---

## 📋 Prerequisites (Check These Now)

### **Shopify API Access**
- [ ] You have Shopify store admin access
- [ ] You can create/use API credentials
- [ ] You have Shopify theme access (can edit `product.liquid`)
- [ ] You have staging/test Shopify store available (for testing)

### **Development Tools**
- [ ] Python 3.8+ installed on your machine
- [ ] Git installed (for version control)
- [ ] Text editor (VS Code, Sublime, etc.)
- [ ] Terminal/command-line comfort (basic commands)

### **Shopify Store Details**
- [ ] Store URL (e.g., `yourstorename.myshopify.com`)
- [ ] Ready to obtain API credentials (will create custom app)

### **Data Ready**
- [ ] Copywriter descriptions ready (JSON format, see template below)
- [ ] Artist data (names, bios, images URLs)
- [ ] Know which 6 products to update (Eddie, Marshall, Miami, Broken Time, CD Watch, Dogma)

---

## 🕐 Timeline (FEB 10-14)

```
FEB 10 (Monday):     Start GraphQL API script — 6 hours
FEB 11 (Tuesday):    Finish GraphQL API script — 2 hours
FEB 12 (Wednesday):  Theme schema injection — 3 hours
FEB 13 (Thursday):   Testing on staging — 2 hours
FEB 14 (Friday):     Final verification + dry run — 1 hour
```

**Total: 14 hours over 5 days (roughly 3 hours/day)**

---

## 📝 STEP 1: Set Up Shopify API Credentials (30 min)

### **1a. Create Shopify Custom App**

1. Go to: Shopify Admin → Apps and integrations → Apps and integrations settings
2. Click: "Develop an app"
3. App name: `"Mad Hudson SEO Phase 1"`
4. Click: "Create an app"

### **1b. Set API Permissions (Scopes)**

In the app settings, go to "Configuration" and grant these scopes ONLY:
```
write_products     (to update product data)
read_products      (to verify updates)
```

**Do NOT grant:**
- `read_customers` (security — don't need customer data)
- `write_orders` (security — don't need order access)
- Any other scopes

### **1c. Generate Access Token**

1. Go to "API credentials" tab
2. Under "Admin API access token", click "Reveal"
3. Copy the token (looks like: `shpat_xxxxxxxxxxxxxxxxxxx`)
4. Store it safely in a `.env` file (see below)

### **1d. Get Store Information**

Find your store's GraphQL endpoint:
```
https://{yourstore}.myshopify.com/admin/api/2024-01/graphql.json
```

Example:
```
https://madhudson.myshopify.com/admin/api/2024-01/graphql.json
```

---

## 🔐 STEP 2: Create `.env` File (Secrets Management)

**Create file:** `~/Desktop/madhudson-seo-project/.env`

```bash
# Shopify API Configuration
SHOPIFY_STORE="madhudson.myshopify.com"
SHOPIFY_API_TOKEN="shpat_your_token_here"
SHOPIFY_API_VERSION="2024-01"

# Staging (for testing)
SHOPIFY_STAGING_STORE="madhudson-staging.myshopify.com"
SHOPIFY_STAGING_TOKEN="shpat_staging_token_here"  # (optional, if you have staging store)
```

**IMPORTANT:** Add to `.gitignore` (ALREADY DONE in this project)

```bash
# In .gitignore (should already be there):
.env
*.pem
*.key
credentials.json
```

Verify by running:
```bash
cat .gitignore | grep "\.env"
# Should return: .env
```

---

## 💻 STEP 3: Build GraphQL API Script (FEB 10-11, 8 hours)

### **3a. Create Script File**

**File path:** `~/Desktop/madhudson-seo-project/scripts/update_shopify_products.py`

```bash
# Create directory
mkdir -p ~/Desktop/madhudson-seo-project/scripts
```

### **3b. Script Code**

**File:** `scripts/update_shopify_products.py`

```python
#!/usr/bin/env python3
"""
Mad Hudson Phase 1: Automated Shopify Product Updates via GraphQL API
Updates 6 products with expanded artist narratives + metadata
"""

import os
import json
import requests
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SHOPIFY_STORE = os.getenv("SHOPIFY_STORE")
SHOPIFY_API_TOKEN = os.getenv("SHOPIFY_API_TOKEN")
SHOPIFY_API_VERSION = os.getenv("SHOPIFY_API_VERSION", "2024-01")

if not SHOPIFY_STORE or not SHOPIFY_API_TOKEN:
    print("ERROR: SHOPIFY_STORE and SHOPIFY_API_TOKEN required in .env")
    sys.exit(1)

GRAPHQL_URL = f"https://{SHOPIFY_STORE}/admin/api/{SHOPIFY_API_VERSION}/graphql.json"
HEADERS = {
    "X-Shopify-Access-Token": SHOPIFY_API_TOKEN,
    "Content-Type": "application/json"
}

def get_product_id(handle):
    """Get Shopify product ID by handle"""
    query = """
    {
      products(first: 1, query: "handle:%s") {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
    """ % handle

    response = requests.post(GRAPHQL_URL, json={"query": query}, headers=HEADERS)
    data = response.json()

    if "errors" in data:
        print(f"ERROR fetching product {handle}: {data['errors']}")
        return None

    products = data.get("data", {}).get("products", {}).get("edges", [])
    if products:
        return products[0]["node"]["id"]
    return None

def update_product(product_id, product_data):
    """Update Shopify product via GraphQL API"""

    # Build metafields for custom data
    metafields = [
        {
            "namespace": "custom",
            "key": "meta_description",
            "value": product_data.get("meta_description", ""),
            "type": "single_line_text"
        },
        {
            "namespace": "custom",
            "key": "artist_name",
            "value": product_data.get("artist_name", ""),
            "type": "single_line_text"
        },
        {
            "namespace": "custom",
            "key": "artist_bio",
            "value": product_data.get("artist_bio", ""),
            "type": "multi_line_text"
        }
    ]

    mutation = """
    mutation UpdateProduct($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          handle
          metafields(first: 10) {
            edges {
              node {
                namespace
                key
                value
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
    """

    variables = {
        "input": {
            "id": product_id,
            "title": product_data.get("title", ""),
            "bodyHtml": product_data.get("body_html", ""),
            "metafields": metafields
        }
    }

    response = requests.post(
        GRAPHQL_URL,
        json={"query": mutation, "variables": variables},
        headers=HEADERS
    )

    data = response.json()

    if "errors" in data:
        print(f"ERROR updating product: {data['errors']}")
        return False

    user_errors = data.get("data", {}).get("productUpdate", {}).get("userErrors", [])
    if user_errors:
        print(f"ERROR: {user_errors}")
        return False

    return True

def load_products_json(filepath):
    """Load product data from JSON file"""
    with open(filepath, "r") as f:
        return json.load(f)

def main():
    """Main execution"""

    # Load products from JSON file
    products_file = "products-to-update.json"

    if not Path(products_file).exists():
        print(f"ERROR: {products_file} not found")
        print("Create this file with product data first")
        sys.exit(1)

    products = load_products_json(products_file)

    print(f"\n{'='*70}")
    print("Mad Hudson Phase 1: Shopify Product Update")
    print(f"{'='*70}")
    print(f"Store: {SHOPIFY_STORE}")
    print(f"Products to update: {len(products)}")
    print(f"{'='*70}\n")

    updated = 0
    failed = 0

    for product_data in products:
        handle = product_data.get("handle")
        print(f"Processing: {handle}...", end=" ")

        # Get product ID from handle
        product_id = get_product_id(handle)
        if not product_id:
            print(f"❌ FAILED (product not found)")
            failed += 1
            continue

        # Update product
        success = update_product(product_id, product_data)
        if success:
            print(f"✅ UPDATED")
            updated += 1
        else:
            print(f"❌ FAILED")
            failed += 1

        # Rate limiting: Wait 500ms between requests to avoid throttling
        time.sleep(0.5)

    print(f"\n{'='*70}")
    print(f"Results: {updated} updated, {failed} failed")
    print(f"{'='*70}\n")

    if failed > 0:
        print("⚠️  Some products failed. Review errors above.")
        sys.exit(1)
    else:
        print("✅ All products updated successfully!")
        sys.exit(0)

if __name__ == "__main__":
    main()
```

### **3c. Install Required Package**

```bash
pip install python-dotenv requests
```

---

## 📦 STEP 4: Create Product Data JSON (FEB 10, 30 min)

### **4a. Create File**

**File path:** `~/Desktop/madhudson-seo-project/products-to-update.json`

```json
[
  {
    "handle": "eddie-watch",
    "title": "Brad Podray × Eddie Watch | Limited Edition Artist Collaboration",
    "body_html": "<h2>The Artist Behind Eddie Watch</h2><p><strong>Brad Podray</strong> is a visual artist known for [artist description]. The Eddie Watch represents a collaboration between [collaboration story]...</p><p>[Full 500-1000 word artist narrative here]</p>",
    "meta_description": "Brad Podray's Eddie Watch: Artist-designed, limited edition pre-order collaboration with Mad Hudson. Where creative culture meets functional design.",
    "artist_name": "Brad Podray",
    "artist_bio": "Brad Podray is a visual artist..."
  },
  {
    "handle": "marshall-watch",
    "title": "Bryce Wong × Marshall Watch | Limited Edition Artist Collaboration",
    "body_html": "<h2>The Artist Behind Marshall Watch</h2><p><strong>Bryce Wong</strong>... [full narrative]</p>",
    "meta_description": "Bryce Wong's Marshall Watch: Artist-made timepiece, 100-piece limited edition pre-order with Mad Hudson.",
    "artist_name": "Bryce Wong",
    "artist_bio": "Bryce Wong is..."
  },
  {
    "handle": "miami-watch",
    "title": "[Artist Name] × Miami Watch | Limited Edition Artist Collaboration",
    "body_html": "...",
    "meta_description": "...",
    "artist_name": "...",
    "artist_bio": "..."
  },
  {
    "handle": "broken-time-watch",
    "title": "...",
    "body_html": "...",
    "meta_description": "...",
    "artist_name": "...",
    "artist_bio": "..."
  },
  {
    "handle": "cd-watch",
    "title": "...",
    "body_html": "...",
    "meta_description": "...",
    "artist_name": "...",
    "artist_bio": "..."
  },
  {
    "handle": "dogma-watch",
    "title": "...",
    "body_html": "...",
    "meta_description": "...",
    "artist_name": "...",
    "artist_bio": "..."
  }
]
```

**Get the full product data from:** Copywriting Coordinator's approved descriptions (FEB 14)

---

## 🎨 STEP 5: Theme Schema Injection (FEB 12, 3 hours)

### **5a. Access Shopify Theme Files**

1. Shopify Admin → Online Store → Themes
2. Find your active theme → Click "Edit code"
3. Find `product.liquid` (in Layout section)

### **5b. Add Schema Markup Template**

At the **end** of `product.liquid` (before closing tags), add:

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

### **5c. Test Schema Markup**

1. Save theme changes
2. Go to a product page (e.g., `/products/eddie-watch`)
3. Right-click → View Page Source
4. Search for `"@type": "Product"` — verify schema is there
5. Go to: [Google Schema Tester](https://schema.org/validator/)
6. Paste product URL
7. Verify schema validates with no errors

---

## ✅ STEP 6: Testing on Staging (FEB 13, 2 hours)

### **6a. Staging Shopify Store (If Available)**

If you have a staging/test Shopify store:

1. Update `.env` with staging credentials:
   ```bash
   SHOPIFY_STAGING_STORE="madhudson-staging.myshopify.com"
   SHOPIFY_STAGING_TOKEN="shpat_staging_token"
   ```

2. Modify script to use staging:
   ```python
   SHOPIFY_STORE = os.getenv("SHOPIFY_STAGING_STORE")
   SHOPIFY_API_TOKEN = os.getenv("SHOPIFY_STAGING_TOKEN")
   ```

3. Run: `python3 scripts/update_shopify_products.py`

4. Verify in staging store:
   - All 6 products updated
   - Descriptions correct
   - H1 tags correct
   - Meta descriptions correct
   - Schema markup present (View Source)

### **6b. No Staging Store? Use Production with Verification**

1. Create backup of product descriptions in a text file
2. Run script on production store
3. Immediately verify all 6 products in Shopify admin:
   - Open each product
   - Check: Title, description, metafields match JSON
4. On live product page, verify schema (View Source)

### **6c. Testing Checklist**

- [ ] GraphQL script runs without errors
- [ ] All 6 products updated in Shopify
- [ ] Product titles include "[Artist] × [Product]"
- [ ] Descriptions are 500+ words
- [ ] Meta descriptions are 155-160 characters
- [ ] Artist names in metafields
- [ ] Schema markup validates (Google Schema Tester)
- [ ] Products look good on live site (no broken formatting)

---

## 📋 STEP 7: Pre-Deployment Checklist (FEB 14, 1 hour)

### **7a. Code Verification**

- [ ] `.env` file has correct credentials
- [ ] `.env` is in `.gitignore` (never commit)
- [ ] Script runs without errors: `python3 scripts/update_shopify_products.py`
- [ ] All 6 products update successfully
- [ ] No API rate-limiting errors

### **7b. Data Verification**

- [ ] products-to-update.json has all 6 products
- [ ] All descriptions are 500+ words
- [ ] All meta descriptions are 155-160 chars
- [ ] All artist names and bios filled in
- [ ] No typos or formatting issues

### **7c. Theme Verification**

- [ ] Schema markup code added to product.liquid
- [ ] No syntax errors in schema (test: `python3 -m json.tool < schema.txt`)
- [ ] Schema validates in Google Schema Tester
- [ ] Live product page displays correctly

### **7d. Security Verification**

- [ ] No API tokens in git: `git status` (should not show .env)
- [ ] Credentials are in .env only
- [ ] .gitignore includes .env
- [ ] No secrets in code comments

### **7e. Rollback Preparation**

- [ ] Manual deployment instructions written down (see Step 8)
- [ ] Current product descriptions backed up
- [ ] Screenshots taken of current state (before FEB 15)

---

## 🚀 STEP 8: FEB 15 Deployment (15 minutes)

### **8a. Pre-Deployment Check (FEB 15, 8:00 AM)**

1. Verify copywriter delivered final descriptions ✅
2. Verify all systems ready (script tested, theme ready, JSON updated)
3. Take screenshot of current product pages (for before/after)

### **8b. Run Update Script (FEB 15, 8:15 AM)**

```bash
cd ~/Desktop/madhudson-seo-project
python3 scripts/update_shopify_products.py
```

**Expected output:**
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

### **8c. Verify on Shopify (FEB 15, 8:20 AM)**

1. Go to Shopify Admin → Products
2. Open each product (check all 6):
   - [ ] Title includes "[Artist] × [Product]"
   - [ ] Description is correct
   - [ ] Metafields populated (artist_name, artist_bio, meta_description)

### **8d. Verify on Live Site (FEB 15, 8:25 AM)**

1. Go to live website (madhudson.com)
2. Click through each product page:
   - [ ] Description displays correctly (no HTML tags showing)
   - [ ] Schema markup present (View Source → search "Person")
   - [ ] Meta description shows in browser tab/search results

### **8e. Message SEO Monitor (FEB 15, 8:30 AM)**

Send message to **seo-monitor**:
```
Phase 1 deployment complete (FEB 15, 8:30 AM UTC).
All 6 product pages updated with artist narratives + schema markup.
Ready to begin baseline ranking capture.
```

---

## 🛑 STEP 9: Rollback Plan (If Something Breaks)

### **9a. If GraphQL Script Fails**

**Before deploying:**
- Keep manual Shopify upload instructions from Copywriting Coordinator
- Have raw product descriptions saved

**If it fails during deployment:**
1. Stop script (Ctrl+C)
2. Manual step: Paste descriptions into Shopify yourself (30 min)
3. Manual step: Deploy schema markup via theme (15 min)
4. Total fallback time: 45 min (still saves 15 min vs. fully manual)

### **9b. If Theme Schema Fails**

**If schema markup doesn't appear:**
1. Remove schema injection code from theme
2. Use Google Tag Manager for schema markup instead (30 min)
3. Verify in Google Schema Tester

### **9c. If Products Look Wrong**

**If formatting broken on live site:**
1. Revert theme changes (use Shopify theme version history)
2. Re-verify product descriptions (check Shopify)
3. Manually fix formatting if needed (15 min)

---

## 📚 Reference: What Files You'll Have

After completing Path B:

```
~/Desktop/madhudson-seo-project/
├── .env (Shopify credentials — NEVER commit)
├── products-to-update.json (6 product descriptions)
├── scripts/
│   └── update_shopify_products.py (GraphQL update script)
├── .gitignore (includes .env)
└── [documentation files]
```

---

## ⏱️ Timeline Summary

| Date | Task | Time | Status |
|------|------|------|--------|
| **FEB 10 (Mon)** | GraphQL script setup + code | 6 hrs | Start today ✅ |
| **FEB 11 (Tue)** | Finish GraphQL script | 2 hrs | Complete by end of day |
| **FEB 12 (Wed)** | Theme schema injection | 3 hrs | Complete by end of day |
| **FEB 13 (Thu)** | Testing on staging | 2 hrs | Verify both systems work |
| **FEB 14 (Fri)** | Final verification + dry run | 1 hr | Ready for deployment |
| **FEB 15 (Sat)** | Deploy to production | 15 min | 8:15 AM morning |

---

## ✅ Success Criteria

By FEB 15 evening:

- ✅ Script runs without errors
- ✅ All 6 products updated in Shopify
- ✅ All descriptions are live on product pages
- ✅ All metadata correct (H1, meta, alt text)
- ✅ Schema markup validates in Google Schema Tester
- ✅ Products look good on live site
- ✅ SEO Monitor notified Phase 1 is live

**If all ✅:** Phase 1 deployment successful. Baseline ranking capture begins.

---

## 🚨 Important Notes

### **Security**
- Never commit `.env` file
- Rotate API credentials quarterly
- Use minimal API scopes (write_products only)
- Store credentials safely

### **API Rate Limiting**
- Script includes 500ms delay between requests
- This prevents Shopify throttling
- Don't remove the `time.sleep(0.5)` line

### **Fallback**
- If script fails, manual deployment is ~45 min (vs. 60 min fully manual)
- Still a 15-minute savings
- Better to have working automation than none at all

### **Testing**
- Test thoroughly on FEB 13
- Don't assume it will work on FEB 15 without testing
- Test on staging store if possible

---

## 🎯 Questions Before You Start?

Before you begin (FEB 10), confirm:

1. Do you have Shopify API access? (admin credentials)
2. Do you have a staging store to test on? (optional but recommended)
3. Can you modify Shopify theme? (theme file access)
4. Do you have Python 3.8+ installed?
5. Do you have copywriter descriptions ready by FEB 14?

---

**Ready to start? Begin with STEP 1 (Shopify API credentials) on FEB 10 morning.**

**Questions? Ask before you start building.**
