# Shopify Backend Integration Opportunities
**Enhance Multi-Agent Phase 1 Workflow with Dev Tools Access**

---

## 🎯 Overview

With **Shopify dev tools access**, you can automate critical Phase 1 tasks that currently require manual work. This document outlines integration opportunities that reduce friction and improve accuracy.

**Current State:** Manual product uploads, schema deployment, QA checking
**Target State:** Automated pipelines with validation hooks

---

## 🔧 Integration Opportunities (Priority Order)

### **PRIORITY 1: Automated Product Page Updates via GraphQL API**

**Problem:** Copywriter delivers 6 descriptions → Connor manually pastes into Shopify → Risk of errors, formatting issues, missing metadata

**Solution:** API-driven product updates
```
Copywriter → JSON output → GraphQL API → Shopify live → Validation → QA report
```

**What This Does:**
1. Copywriting Coordinator sends 6 product descriptions as JSON (instead of plain text)
2. Script reads JSON and calls Shopify GraphQL API
3. Automatically updates:
   - Product description (body HTML)
   - H1 tag (via metafield if needed, or product title format)
   - Meta description (via metafield or SEO fields)
   - Product images alt text
   - Product tags (artist name, keywords)
4. Returns: Success/failure report + validation checks
5. Connor reviews report before publishing

**Benefits:**
- ✅ Zero manual copy-paste errors
- ✅ Consistent formatting across all 6 products
- ✅ Metadata validated before live
- ✅ Audit trail of what changed when
- ✅ Saves 30-45 min manual upload time (FEB 15-16)

**Implementation Level:** Medium (requires GraphQL knowledge, but standard Shopify practice)

**Example JSON Format (from Copywriter):**
```json
[
  {
    "product_id": "eddie-watch",
    "title": "Brad Podray × Eddie Watch | Limited Edition Artist Collaboration",
    "body_html": "<p>500+ word artist narrative...</p>",
    "meta_description": "Brad Podray's Eddie Watch: Artist-designed, limited edition pre-order collaboration with Mad Hudson.",
    "artist_name": "Brad Podray",
    "keywords": ["watches for creators", "artist-made watches", "artist collaboration watch"],
    "images": [
      {
        "alt": "Brad Podray designing the Eddie Watch in his studio",
        "src": "cdn_url_here"
      }
    ]
  },
  // ... 5 more products
]
```

**GraphQL Query (Example):**
```graphql
mutation UpdateProductMetadata($input: ProductInput!) {
  productUpdate(input: $input) {
    product {
      id
      title
      handle
      description
      metafields(first: 10) { nodes { key value } }
    }
    userErrors { field message }
  }
}
```

**Who Implements:** You (with dev tools access) or a Shopify API developer

---

### **PRIORITY 2: Schema Markup Auto-Injection via Theme**

**Problem:** Manual schema markup deployment via Google Tag Manager or hardcoding → Risk of validation errors, missing fields, inconsistent formatting

**Solution:** Theme-based schema injection
```
Press Outreach → Artist data JSON → Theme script → Inject Person + Product schema → Validate
```

**What This Does:**
1. Press Outreach provides artist data (name, bio, image URL)
2. Theme file (liquid template) contains reusable schema template
3. Script injects Person schema + updates Product schema automatically
4. All product pages get correct schema markup on load
5. Validation check runs: Google Schema Tester verification

**Benefits:**
- ✅ No manual GTM setup needed
- ✅ Schema consistent across all products
- ✅ Auto-updates when artist data changes
- ✅ Validation prevents broken schema
- ✅ Saves 15 min manual deployment (FEB 15-16)

**Implementation Level:** Low-Medium (modifying Shopify theme file)

**Example Theme Implementation (Liquid):**
```liquid
{% capture product_schema %}
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{{ product.title }}",
  "description": "{{ product.description | strip_html | truncate: 155 }}",
  "image": "{{ product.featured_image | img_url: '600x600' }}",
  "brand": {
    "@type": "Brand",
    "name": "Mad Hudson"
  },
  "creator": {
    "@type": "Person",
    "name": "{{ product.metafields.custom.artist_name.value }}",
    "image": "{{ product.metafields.custom.artist_image.value }}",
    "description": "{{ product.metafields.custom.artist_bio.value }}"
  }
}
{% endcapture %}

<script type="application/ld+json">
  {{ product_schema | json }}
</script>
```

**Implementation:** Add to Shopify theme's `product.liquid` template

---

### **PRIORITY 3: Publish-Time SEO Audit Hooks**

**Problem:** After copy is live, errors go unnoticed until SEO Monitor checks (weeks later). Copywriting Coordinator can't validate automatically.

**Solution:** Automated SEO validation on product publish
```
Product published → Audit hook runs → Checks all SEO signals → Report to QA
```

**What This Does:**
1. When product page is published, webhook triggers
2. Runs automatic checks:
   - ✅ H1 tag contains artist name?
   - ✅ Meta description 155-160 chars?
   - ✅ Meta description includes keyword ("artist-made", "collaboration", etc.)?
   - ✅ All product images have alt text?
   - ✅ Alt text is descriptive (not just "watch.jpg")?
   - ✅ Product description 500+ words?
   - ✅ Schema markup present and valid?
   - ✅ Product tags include artist name?
3. Generates: `seo-audit-[product-handle].md` with PASS/FAIL for each check
4. Sends to Copywriting Coordinator for review

**Benefits:**
- ✅ Catches metadata errors immediately
- ✅ Prevents bad SEO signals from going live
- ✅ Automated QA reduces manual checking
- ✅ Copywriting Coordinator gets instant feedback
- ✅ SEO Monitor gets cleaner baseline (no metadata issues to fix)

**Implementation Level:** Medium (Shopify webhook + backend processing)

**Example Report Output:**
```markdown
# SEO Audit — Eddie Watch [2026-02-15]

## Product Metadata ✅
- [✅] H1 tag: "Brad Podray × Eddie Watch | Limited Edition Artist Collaboration"
- [✅] Meta description (160 chars): "Brad Podray's Eddie Watch..."
- [✅] Includes keyword: "artist-made" ✅

## Content ✅
- [✅] Description length: 847 words (target: 500+)
- [✅] Keyword density: "watches for creators" (3x), "artist collaboration" (2x)

## Images & Alt Text ✅
- [✅] Main image alt: "Brad Podray × Eddie Watch, limited edition collaboration"
- [✅] Artist photo alt: "Brad Podray in his studio, designing the Eddie Watch"
- [⚠️] Process image alt: Missing descriptive text (add: "Design process detail...")

## Schema Markup ✅
- [✅] Product schema present
- [✅] Creator/Person schema present
- [✅] Validates in Google Schema Tester

## Summary
PASS with 1 minor issue (image alt text).
Ready for publication.

Co-Authored: SEO Audit Hook
```

---

### **PRIORITY 4: Baseline Capture Webhook Coordination**

**Problem:** SEO Monitor doesn't know exact moment Phase 1 goes live → Baseline capture might be off by hours or days → Less precise tracking

**Solution:** Webhook notification on product publish
```
Products published → Webhook fires → SEO Monitor notified → Baseline capture triggered immediately
```

**What This Does:**
1. When Phase 1 products go live on Shopify (FEB 15)
2. Webhook fires with exact timestamp + list of products published
3. Sends message to SEO Monitor: "Phase 1 live at [timestamp]. Begin baseline capture now."
4. SEO Monitor captures rankings within 1 hour of deployment
5. Precise baseline = more accurate impact measurement

**Benefits:**
- ✅ SEO Monitor knows exactly when Phase 1 went live
- ✅ No manual coordination needed
- ✅ Baseline captured at optimal time
- ✅ Improves tracking precision through Apr 7 checkpoint

**Implementation Level:** Low (Shopify webhook to external endpoint)

---

### **PRIORITY 5: Real-Time Traffic Monitoring Dashboard**

**Problem:** Analytics Reporter only delivers monthly reports → No early signal detection → Delayed decision-making

**Solution:** Real-time product view tracking
```
Products viewed → Analytics tracked → Dashboard updated → Early signals detected
```

**What This Does:**
1. Add tracking pixel or custom event to product pages
2. Track: Which products getting views, source (organic vs. direct vs. referral)
3. Dashboard shows:
   - Daily organic visits to each product page
   - Traffic source breakdown
   - Bounce rate by product
   - Pages/session metrics
4. Alert triggered if product page traffic spikes
5. Early indicator of Phase 1 impact (before Google counts it)

**Benefits:**
- ✅ See Phase 1 impact immediately (not waiting for Google)
- ✅ Identify which products resonating with audiences
- ✅ Traffic alerts help detect ranking movement early
- ✅ Informs Phase 2 strategy (which products to feature in blogs)

**Implementation Level:** Medium (custom analytics integration)

---

### **PRIORITY 6: Automated Product Data Versioning**

**Problem:** Hard to track what changed between phases → No rollback if something breaks

**Solution:** Version control for product metadata
```
Each publish → Snapshot saved → Version history tracked → Rollback available
```

**What This Does:**
1. Every time product page is updated, snapshot entire metadata:
   - Title, description, H1, meta, images, alt text, schema
2. Save to version control with timestamp + author
3. Create audit trail:
   - What changed? When? By whom?
   - Before/after comparison available
4. Rollback capability: If Phase 1 breaks something, revert to previous version

**Benefits:**
- ✅ Full audit trail of all changes
- ✅ Easy rollback if issues arise
- ✅ Learn from Phase 1 (what worked, what didn't)
- ✅ Confidence to experiment safely

**Implementation Level:** Low-Medium (Git + snapshot storage)

---

## 🚀 Recommended Implementation Path

### **For Phase 1 (Feb 10-16): Do This First**
**Effort: Medium | Impact: High**

```
1. PRIORITY 1: GraphQL API for product updates
   └─ Saves 30-45 min manual work on FEB 15-16
   └─ Eliminates copy-paste errors
   └─ Copywriter → JSON → Live (no Connor manual work)

2. PRIORITY 2: Schema markup theme injection
   └─ Saves 15 min technical deployment on FEB 15-16
   └─ Replaces manual GTM setup
   └─ Press Outreach → Artist data → Theme → Schema live
```

**Timeline:** Build these by FEB 14, test FEB 15 morning, deploy FEB 15 afternoon

**Benefit:** Phase 1 goes live faster, cleaner, with fewer errors

---

### **For Phase 1 (Feb 17+): Add These**
**Effort: Low-Medium | Impact: Medium**

```
3. PRIORITY 3: SEO audit hooks on publish
   └─ Immediate QA feedback
   └─ Catches errors before they impact rankings

4. PRIORITY 4: Baseline capture webhook
   └─ Precise moment tracking
   └─ Better baseline accuracy
```

---

### **For Phase 2 (After Apr 7): Nice to Have**
**Effort: Low-Medium | Impact: Medium**

```
5. PRIORITY 5: Real-time traffic monitoring
   └─ Early signal detection
   └─ Informs blog strategy

6. PRIORITY 6: Product data versioning
   └─ Audit trail + rollback safety
   └─ Learn from Phase 1
```

---

## 📋 Implementation Checklist

### **Before FEB 15 (Phase 1 Deployment)**

#### **GraphQL API Integration**
- [ ] Set up Shopify API credentials (private app or custom app with product write scope)
- [ ] Create script that reads JSON from copywriter
- [ ] Test with 1 product (Eddie Watch)
- [ ] Verify all fields update correctly in Shopify
- [ ] Create validation report template
- [ ] Document rollback procedure (in case of errors)

#### **Schema Markup Theme Injection**
- [ ] Access Shopify theme (probably `product.liquid`)
- [ ] Add Person schema template with liquid variables
- [ ] Update Product schema to include creator field
- [ ] Test schema in Google Schema Tester
- [ ] Verify shows on live product page
- [ ] Document artist data metafield requirements

#### **Testing**
- [ ] Dry run: GraphQL update on staging product
- [ ] Dry run: Schema markup on test product
- [ ] Verify Copywriting Coordinator can send JSON in correct format
- [ ] Verify Press Outreach can provide artist data correctly

---

## 🔐 Security Considerations

**API Credentials:**
- Store Shopify API credentials in `.env` file (NEVER commit to git)
- Use `.gitignore` to exclude `.env`
- Rotate credentials quarterly
- Consider using custom app with minimal scopes (product write only, no read customer data)

**Data Access:**
- Read-only access for reporting agents (Analytics Reporter, SEO Monitor)
- Write access only for Copywriting Coordinator (product updates)
- Audit log all API calls for compliance

**Rate Limiting:**
- Shopify API has rate limits (2 requests/second typically)
- Batch product updates to avoid throttling
- Implement exponential backoff for retries

---

## 💻 Code Examples

### **Example: GraphQL Product Update Script (Python)**
```python
import requests
import json
import os

SHOPIFY_STORE = os.getenv("SHOPIFY_STORE")
SHOPIFY_API_TOKEN = os.getenv("SHOPIFY_API_TOKEN")

def update_product_via_graphql(product_data):
    """Update Shopify product using GraphQL API"""

    url = f"https://{SHOPIFY_STORE}/admin/api/2024-01/graphql.json"

    mutation = """
    mutation UpdateProduct($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          handle
          metafields(first: 10) { nodes { key value } }
        }
        userErrors { field message }
      }
    }
    """

    variables = {
        "input": {
            "id": f"gid://shopify/Product/{product_data['product_id']}",
            "title": product_data["title"],
            "bodyHtml": product_data["body_html"],
            "metafields": [
                {"namespace": "custom", "key": "meta_description", "value": product_data["meta_description"], "type": "single_line_text"},
                {"namespace": "custom", "key": "artist_name", "value": product_data["artist_name"], "type": "single_line_text"}
            ]
        }
    }

    headers = {
        "X-Shopify-Access-Token": SHOPIFY_API_TOKEN,
        "Content-Type": "application/json"
    }

    response = requests.post(url, json={"query": mutation, "variables": variables}, headers=headers)
    return response.json()

# Load products from copywriter JSON
with open("products.json") as f:
    products = json.load(f)

# Update each product
for product in products:
    result = update_product_via_graphql(product)
    print(f"Updated {product['product_id']}: {result}")
```

### **Example: Webhook Handler (Python/Flask)**
```python
from flask import Flask, request
import hmac
import hashlib

app = Flask(__name__)
SHOPIFY_WEBHOOK_SECRET = os.getenv("SHOPIFY_WEBHOOK_SECRET")

def verify_webhook(request):
    """Verify webhook came from Shopify"""
    hmac_header = request.headers.get('X-Shopify-Hmac-SHA256')
    body = request.get_data()

    hash = hmac.new(SHOPIFY_WEBHOOK_SECRET.encode('utf-8'), body, hashlib.sha256)
    computed_hmac = base64.b64encode(hash.digest()).decode()

    return hmac.compare_digest(computed_hmac, hmac_header)

@app.route('/webhooks/products/publish', methods=['POST'])
def product_published():
    """Triggered when product is published"""

    if not verify_webhook(request):
        return {"error": "Unauthorized"}, 401

    data = request.get_json()
    product_id = data['id']
    product_handle = data['handle']
    timestamp = datetime.now().isoformat()

    # Notify SEO Monitor that Phase 1 is live
    send_message_to_seo_monitor(
        f"Phase 1 product published: {product_handle} at {timestamp}. Begin baseline capture."
    )

    # Run SEO audit
    audit_result = run_seo_audit(product_handle)
    save_audit_report(f"seo-audit-{product_handle}.md", audit_result)

    return {"status": "received"}, 200
```

---

## 📊 Expected Impact

### **Time Savings (FEB 15-16)**
- Manual Shopify uploads: 30-45 min → 5 min (automated)
- Schema deployment: 15 min → 2 min (auto-injected)
- Metadata QA: 20 min → 5 min (auto-audited)
- **Total saved: ~60-75 minutes**

### **Quality Improvements**
- ✅ Zero copy-paste errors
- ✅ Consistent formatting across all products
- ✅ Validated metadata before live
- ✅ Schema markup always correct
- ✅ Earlier error detection

### **Tracking Precision**
- Exact Phase 1 deployment timestamp
- Immediate baseline capture notification
- Better ranking movement attribution

---

## 🎯 Next Steps

**Choose your integration path:**

**Option A: Full Integration (3-4 days, ~20 hours development)**
- Implement PRIORITY 1 + PRIORITY 2 + PRIORITY 3 + PRIORITY 4
- Deploy by FEB 14 morning
- Phase 1 runs fully automated Feb 15-16

**Option B: Partial Integration (1-2 days, ~6 hours development)**
- Implement PRIORITY 1 + PRIORITY 2 only
- Deploy by FEB 14 morning
- Core Phase 1 automated, QA/tracking manual for now

**Option C: Manual (0 hours development)**
- Keep current manual process
- Takes longer, more error-prone
- Can integrate later if issues arise

---

## 📞 Questions?

Need help with:
- Shopify GraphQL API implementation details?
- Theme liquid code for schema injection?
- Webhook setup + verification?
- Security/credentials management?
- Testing strategy?

Let me know which integrations you want to pursue, and I can provide detailed implementation guides.

---

**Status:** Ready for integration planning

**Recommendation:** Implement PRIORITY 1 + PRIORITY 2 before FEB 15 Phase 1 deployment (saves 45-60 min manual work + improves quality)
