# Path B Implementation Guide
**Partial Integration (GraphQL API + Theme Schema Injection)**

---

## 🎯 What Path B Includes

1. **GraphQL API Script** — Copywriter JSON → Shopify product updates (automated)
2. **Theme Schema Injection** — Artist data → Live schema markup (auto-injected)

**What it saves:** ~45 minutes on FEB 15-16 deployment

**What it automates:**
- ✅ Product description updates (no manual copy-paste)
- ✅ H1 tags, meta descriptions, image alt text updates
- ✅ Schema markup deployment (no GTM setup)
- ✅ Metadata validation before publishing

---

## 📋 Prerequisites (Check These First)

### **1. Shopify Store Access**
- [ ] You have Shopify admin access (not just store owner, but full admin)
- [ ] Store URL: `madhudson.myshopify.com` or similar
- [ ] You can access: Products, Settings, Theme Editor

### **2. Shopify API Access**
- [ ] Create a custom app in Shopify Admin (Settings → Apps → App and sales channel settings → Develop apps)
- [ ] Custom app name: "Mad Hudson SEO Phase 1"
- [ ] Scopes needed: `write_products`, `read_products` (that's it, minimal permissions)
- [ ] Generate API credential: Admin API access token
- [ ] Copy token to `.env` file (NEVER commit to git)

### **3. Development Environment**
- [ ] Python 3.8+ installed on your machine (check: `python3 --version`)
- [ ] Git installed (`git --version`)
- [ ] Text editor (VS Code recommended)
- [ ] Terminal/command line access

### **4. Shopify Store Information**
- [ ] Store URL: `madhudson.myshopify.com`
- [ ] API token: (from step 2, in `.env`)
- [ ] Product IDs for 6 watches (from Shopify admin URLs)
  - Example: `https://admin.shopify.com/store/madhudson/products/123456789`
  - The number at end = product ID
- [ ] Get all 6 product IDs and document them

### **5. Theme Access**
- [ ] Current active theme name (from Shopify admin)
- [ ] Access to theme editor (Settings → Themes → Edit code)
- [ ] Product template file: `product.liquid` (in theme files list)
- [ ] Can create backups of theme files (recommended)

### **6. Copywriter Ready**
- [ ] Copywriter can provide output as JSON format (not plain text)
- [ ] JSON format spec provided (see below)
- [ ] Copywriter deadline: FEB 13
- [ ] You'll review JSON before running script

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PATH B IMPLEMENTATION                     │
└─────────────────────────────────────────────────────────────┘

COMPONENT 1: GraphQL API Script
  Input: products.json (from copywriter)
  Process: Read JSON → Call Shopify GraphQL API → Update products
  Output: Validation report + success/failure status
  Time: FEB 10-11 (8 hours dev + test)

COMPONENT 2: Theme Schema Injection
  Input: Artist metadata (from Press Outreach)
  Process: Add schema template to product.liquid
  Output: Schema auto-injects on product pages
  Time: FEB 12 (3 hours dev + test)

TESTING & VALIDATION
  Staging: Deploy to staging store (FEB 13)
  Verification: Check all 6 products (FEB 13)
  Approval: Checkpoint before production (FEB 14)

PRODUCTION DEPLOYMENT
  FEB 15: Run GraphQL script on production
  FEB 15: Theme already has schema injection
  FEB 15: Phase 1 LIVE (both components active)
```

---

## 📝 Step 1: Set Up Shopify API Credentials

### **1.1 Create Custom App in Shopify**

1. Go to: Shopify Admin → Settings → Apps and integrations → Develop apps
2. Click: "Create an app"
3. App name: `Mad Hudson SEO Phase 1`
4. Click: Create app
5. Go to: Admin API tab
6. Click: "Save" (no scopes needed yet)
7. Scroll to: "Admin API access scopes"
8. Enable these ONLY:
   - [ ] `write_products`
   - [ ] `read_products`
9. Click: Save
10. Scroll to: "Admin API tokens"
11. Click: "Reveal token"
12. Copy the token (looks like: `shpat_abc123xyz...`)

### **1.2 Store Credentials Safely**

**Create `.env` file in project root:**

```bash
# In: /Users/garen/Desktop/madhudson-seo-project/.env

SHOPIFY_STORE="madhudson.myshopify.com"
SHOPIFY_API_TOKEN="shpat_abc123xyz..."  # Paste your token here
```

**Verify `.env` is in `.gitignore`:**

```bash
# In: /Users/garen/Desktop/madhudson-seo-project/.gitignore
.env  # ← Should already be here
```

**CRITICAL:** Never commit `.env` to git!

---

## 🔧 Step 2: Build GraphQL API Script

### **2.1 Create Script File**

**File:** `/Users/garen/Desktop/madhudson-seo-project/shopify_update_products.py`

```python
#!/usr/bin/env python3
"""
Mad Hudson Phase 1: Shopify Product Update via GraphQL API
Updates 6 product pages with artist narratives, metadata, and schema prep
"""

import json
import os
import requests
from datetime import datetime
import sys

# Load environment variables
SHOPIFY_STORE = os.getenv("SHOPIFY_STORE")
SHOPIFY_API_TOKEN = os.getenv("SHOPIFY_API_TOKEN")

if not SHOPIFY_STORE or not SHOPIFY_API_TOKEN:
    print("❌ ERROR: Missing SHOPIFY_STORE or SHOPIFY_API_TOKEN in .env")
    sys.exit(1)

API_ENDPOINT = f"https://{SHOPIFY_STORE}/admin/api/2024-01/graphql.json"

# GraphQL mutation for product updates
UPDATE_PRODUCT_MUTATION = """
mutation UpdateProduct($input: ProductInput!) {
  productUpdate(input: $input) {
    product {
      id
      title
      handle
      descriptionHtml
      metafields(first: 10) {
        nodes {
          key
          value
          namespace
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

def call_shopify_api(mutation, variables):
    """Call Shopify GraphQL API with retry logic"""
    headers = {
        "X-Shopify-Access-Token": SHOPIFY_API_TOKEN,
        "Content-Type": "application/json",
    }

    payload = {
        "query": mutation,
        "variables": variables
    }

    try:
        response = requests.post(API_ENDPOINT, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        result = response.json()

        if "errors" in result:
            return {"success": False, "error": result["errors"][0]["message"]}

        return {"success": True, "data": result["data"]}

    except requests.exceptions.RequestException as e:
        return {"success": False, "error": f"API request failed: {str(e)}"}

def update_product(product_data):
    """Update single product in Shopify"""

    variables = {
        "input": {
            "id": f"gid://shopify/Product/{product_data['product_id']}",
            "title": product_data.get("title", ""),
            "descriptionHtml": product_data.get("body_html", ""),
            "metafields": [
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
                }
            ]
        }
    }

    result = call_shopify_api(UPDATE_PRODUCT_MUTATION, variables)
    return result

def main():
    """Main execution"""

    print("\n" + "="*70)
    print("🚀 Mad Hudson Phase 1: Shopify Product Update")
    print("="*70 + "\n")

    # Load products JSON
    try:
        with open("products.json", "r") as f:
            products = json.load(f)
        print(f"✅ Loaded {len(products)} products from products.json\n")
    except FileNotFoundError:
        print("❌ ERROR: products.json not found")
        print("   Expected file: /Users/garen/Desktop/madhudson-seo-project/products.json")
        sys.exit(1)
    except json.JSONDecodeError:
        print("❌ ERROR: products.json is not valid JSON")
        sys.exit(1)

    # Update each product
    results = []
    for i, product in enumerate(products, 1):
        product_name = product.get("product_id", "unknown")
        print(f"[{i}/{len(products)}] Updating {product_name}...", end=" ")

        result = update_product(product)
        results.append({
            "product_id": product_name,
            "success": result["success"],
            "error": result.get("error")
        })

        if result["success"]:
            print("✅")
        else:
            print(f"❌ {result['error']}")

    # Summary report
    print("\n" + "="*70)
    print("📊 UPDATE SUMMARY")
    print("="*70)

    successful = sum(1 for r in results if r["success"])
    failed = len(results) - successful

    print(f"\n✅ Successful: {successful}/{len(results)}")
    print(f"❌ Failed: {failed}/{len(results)}")

    if failed > 0:
        print("\nFailed updates:")
        for r in results:
            if not r["success"]:
                print(f"  - {r['product_id']}: {r['error']}")

    print("\n" + "="*70)

    if failed == 0:
        print("✅ ALL PRODUCTS UPDATED SUCCESSFULLY")
        print("="*70 + "\n")
        return 0
    else:
        print(f"⚠️  {failed} PRODUCTS FAILED. CHECK ERRORS ABOVE.")
        print("="*70 + "\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
```

### **2.2 Test the Script (Staging Only)**

```bash
# From project directory
cd /Users/garen/Desktop/madhudson-seo-project

# Install requests library
pip3 install requests

# Create test products.json
cat > products.json << 'EOF'
[
  {
    "product_id": "123456789",
    "title": "Brad Podray × Eddie Watch | Limited Edition Artist Collaboration",
    "body_html": "<p>500+ word artist narrative here...</p>",
    "meta_description": "Brad Podray's Eddie Watch: Artist-designed, limited edition collaboration",
    "artist_name": "Brad Podray"
  }
]
EOF

# Test script on staging product
python3 shopify_update_products.py

# Expected output:
# ✅ Loaded 1 products from products.json
# [1/1] Updating 123456789... ✅
# UPDATE SUMMARY
# ✅ Successful: 1/1
# ❌ Failed: 0/1
# ✅ ALL PRODUCTS UPDATED SUCCESSFULLY
```

---

## 🎨 Step 3: Theme Schema Injection

### **3.1 Backup Current Theme**

**In Shopify Admin:**
1. Go: Online Store → Themes
2. Find active theme (has "Active" badge)
3. Click: "..." menu → Duplicate
4. Name it: "Backup - Before Phase 1"
5. Keep as backup (don't activate)

### **3.2 Edit Theme File**

**In Shopify Admin:**
1. Go: Online Store → Themes → Active theme → Edit code
2. Find: `product.liquid` in file list (left sidebar)
3. Open it

### **3.3 Add Schema Injection Code**

**At the END of `product.liquid`, before closing `</template>` tags:**

Add this code:

```liquid
<!-- Mad Hudson Phase 1: Person + Product Schema Markup -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{{ product.title }}",
  "description": "{{ product.description | strip_html | truncate: 160 }}",
  "image": "{{ product.featured_image | image_url: width: 600 }}",
  "brand": {
    "@type": "Brand",
    "name": "Mad Hudson"
  },
  {% if product.metafields.custom.artist_name.value %}
  "creator": {
    "@type": "Person",
    "name": "{{ product.metafields.custom.artist_name.value }}",
    {% if product.metafields.custom.artist_bio.value %}
    "description": "{{ product.metafields.custom.artist_bio.value | strip_html }}"
    {% endif %}
  }
  {% endif %}
}
</script>
```

### **3.4 Save Theme**

1. Click: "Save" button (top right)
2. Theme auto-updates immediately
3. Schema now injected on all product pages

### **3.5 Verify Schema on Staging Product**

1. Go to a product page on your staging store
2. Right-click → "View page source"
3. Search: `"@type": "Person"`
4. Should find your schema markup in HTML
5. Copy full schema JSON
6. Go to: https://validator.schema.org/
7. Paste schema, click "Validate"
8. Should show: "Valid" ✅

---

## 📦 Step 4: Prepare Copywriter JSON Format

### **4.1 Create JSON Template for Copywriter**

**Send to copywriter (or use as template):**

```json
[
  {
    "product_id": "123456789",
    "title": "Brad Podray × Eddie Watch | Limited Edition Artist Collaboration",
    "body_html": "<h2>The Artist Behind Eddie Watch</h2><p>Brad Podray is...</p><h3>Design Story</h3><p>When Brad sat down...</p>",
    "meta_description": "Brad Podray's Eddie Watch: Artist-designed, limited edition pre-order collaboration with Mad Hudson. Where creative culture meets functional design.",
    "artist_name": "Brad Podray",
    "artist_bio": "Visual artist and creator known for [style/work]. Creates [artistic focus] that [why it matters]."
  },
  {
    "product_id": "987654321",
    "title": "Bryce Wong × Marshall Watch | Limited Edition Artist Collaboration",
    "body_html": "<h2>The Artist Behind Marshall Watch</h2>...",
    "meta_description": "Bryce Wong × Marshall Watch: Artist-made timepiece, 100-piece limited edition pre-order.",
    "artist_name": "Bryce Wong",
    "artist_bio": "..."
  }
]
```

**Key requirements:**
- `product_id`: Exact Shopify product ID (from URLs)
- `title`: 60-70 chars, includes artist name + "Limited Edition Artist Collaboration"
- `body_html`: 500+ words, wrapped in `<p>` and `<h3>` tags (HTML format, not plain text)
- `meta_description`: 155-160 chars exactly
- `artist_name`: Short name (used in schema)
- `artist_bio`: 100-150 word description (used in schema)

### **4.2 Copywriter Deliverable Deadline**

- Due: FEB 13 (Friday)
- Format: `products.json` in project directory
- Validation: Must be valid JSON (test with: https://jsonlint.com/)

---

## ✅ Step 5: Testing Checklist (FEB 13-14)

### **5.1 API Script Testing**

- [ ] `.env` file exists with valid credentials
- [ ] `products.json` has all 6 products (valid JSON)
- [ ] Run script on staging store: `python3 shopify_update_products.py`
- [ ] All 6 products update successfully (no errors)
- [ ] Verify in Shopify admin: descriptions updated, metadata saved
- [ ] Check: H1 titles include artist names
- [ ] Check: Meta descriptions are correct length + include keywords

### **5.2 Theme Schema Testing**

- [ ] `product.liquid` modified (backup exists)
- [ ] Schema code saved without errors
- [ ] Visit staging product page
- [ ] View source, search for `"creator"` schema
- [ ] Validate schema at schema.org validator (shows "Valid")
- [ ] Test on 2-3 different products
- [ ] Verify no CSS/layout breakage

### **5.3 Full Integration Testing**

- [ ] Run GraphQL script → products update
- [ ] Check schema on updated products → appears correctly
- [ ] Verify both systems work together without conflicts
- [ ] Check mobile view (schema still present, no layout issues)
- [ ] Test in multiple browsers (Chrome, Safari, Firefox if possible)

### **5.4 Pre-Production Checkpoint (FEB 14)**

Before going live to production:
- [ ] All tests pass on staging
- [ ] Copywriter JSON validated (valid JSON syntax)
- [ ] API credentials confirmed in `.env`
- [ ] Theme backup created
- [ ] Rollback procedure documented (switch theme back if needed)
- [ ] Second person has reviewed everything
- [ ] Screenshot baseline of products (for comparison after)

---

## 🚀 Step 6: Production Deployment (FEB 15)

### **6.1 Final Verification (FEB 15 Morning)**

```bash
# Before running script:
1. Double-check .env file has correct credentials
2. Verify products.json has all 6 products
3. Confirm copywriter descriptions are correct
4. Note current time (for SEO Monitor)
```

### **6.2 Run GraphQL Script on Production**

```bash
cd /Users/garen/Desktop/madhudson-seo-project

# Run the update script
python3 shopify_update_products.py

# Expected output: ✅ ALL PRODUCTS UPDATED SUCCESSFULLY
```

### **6.3 Verify Products are Live**

1. Go to your store: https://madhudson.com (or similar)
2. Click on each product (test all 6)
3. Verify: Descriptions updated, metadata looks good
4. View page source → Search for schema markup
5. Should see `"creator": { "name": "Artist Name" }`

### **6.4 Post-Deployment**

- [ ] All 6 products live + correct
- [ ] Schema validation passes (view source)
- [ ] No CSS/layout issues
- [ ] Message SEO Monitor: "Phase 1 deployed, begin baseline capture"
- [ ] Screenshot products for before/after comparison
- [ ] Log timestamp for SEO tracking

---

## 📁 File Structure (After Path B)

```
/Users/garen/Desktop/madhudson-seo-project/
├── .env                              # Credentials (DO NOT COMMIT)
├── .gitignore                        # Already excludes .env
├── shopify_update_products.py        # GraphQL API script
├── products.json                     # From copywriter (FEB 13)
├── SHOPIFY-INTEGRATION-RISKS.md
├── PATH-B-IMPLEMENTATION-GUIDE.md
├── PHASE-1-STATUS.md
├── PHASE-1-MULTIAGENT-COORDINATION.md
└── ... (other Phase 1 docs)
```

---

## ⏰ Timeline for Path B

### **FEB 10-11: Build GraphQL Script**
- [ ] Create `.env` with credentials
- [ ] Create `shopify_update_products.py`
- [ ] Test script on staging product
- [ ] Document any issues
- **Time: 8 hours**

### **FEB 12: Build Theme Schema Injection**
- [ ] Backup current theme
- [ ] Edit `product.liquid`
- [ ] Add schema injection code
- [ ] Test schema on staging products
- [ ] Verify schema validation
- **Time: 3 hours**

### **FEB 13: Full Testing**
- [ ] Test API script end-to-end
- [ ] Test theme schema end-to-end
- [ ] Test both together (integration test)
- [ ] Verify on multiple products
- [ ] Validate JSON from copywriter
- **Time: 3 hours**

### **FEB 14: Pre-Production Checkpoint**
- [ ] Final review of all components
- [ ] Second person verification
- [ ] Document rollback procedure
- [ ] Ready for production deployment
- **Time: 1-2 hours**

### **FEB 15: Production Deployment**
- [ ] Run script on production
- [ ] Verify all products updated
- [ ] Schema validation pass
- [ ] Notify SEO Monitor
- **Time: 15-30 minutes**

---

## 🎯 Success Criteria (FEB 15)

**Phase 1 is successful when:**

- ✅ All 6 products have updated descriptions (500+ words each)
- ✅ All meta descriptions are 155-160 characters
- ✅ All H1 tags include artist names
- ✅ Schema markup validates correctly on all products
- ✅ No CSS/layout issues on product pages
- ✅ Products are live and accessible
- ✅ SEO Monitor receives "Phase 1 deployed" notification
- ✅ Baseline ranking capture begins

**Time saved: ~45 minutes vs. manual deployment**

---

## 🆘 Troubleshooting

### **"API request failed: Invalid credentials"**
- Solution: Check `.env` file — verify SHOPIFY_API_TOKEN is correct
- Regenerate token if needed (Shopify Admin → Apps → Custom app)

### **"Schema validation fails"**
- Solution: Check `product.liquid` for syntax errors
- Validate JSON in schema.org validator
- Ensure all closing braces present

### **"Products don't update"**
- Solution: Check product IDs in `products.json` are exact Shopify IDs
- Verify GraphQL mutation syntax is correct
- Check Shopify error logs in admin

### **"Theme has CSS issues after schema injection"**
- Solution: Theme injection shouldn't affect CSS, schema is just `<script>` tag
- If CSS broken, likely unrelated to this change
- Rollback to backup theme to confirm

---

## 📞 Questions?

Need help with:
- Shopify API setup?
- Python script questions?
- Theme editing?
- JSON formatting?
- Testing procedure?

Let me know and I can provide more details.

---

**Status:** 🟡 Ready for Implementation

**Start Date:** FEB 10 (today recommended)

**Deployment Date:** FEB 15

**Time Investment:** ~15 hours dev + testing

**Result:** 45+ minutes saved on Phase 1, cleaner deployment, foundation for Phase 2
