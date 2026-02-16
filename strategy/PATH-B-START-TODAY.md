# Path B — START TODAY
**Partial Integration (GraphQL API + Theme Schema)**

---

## ✅ Decision Confirmed

You're doing **Path B: Partial Integration**

**Timeline:** FEB 10-14 (development) + FEB 15 (deployment)
**Dev Time:** 14 hours total
**Deployment Time:** 12 minutes
**Time Saved:** ~45 minutes on Feb 15

---

## 🚀 Your Exact Timeline

### **TODAY (FEB 10) — 2-3 hours**

**Step 1: Shopify API Setup (30 min)**
- [ ] Go to Shopify Admin → Settings → Apps and integrations → Develop apps
- [ ] Create app: "Mad Hudson SEO Phase 1"
- [ ] Enable scopes: `write_products`, `read_products` ONLY
- [ ] Generate Admin API token
- [ ] Copy token to `.env` file (never commit!)

**Step 2: Create `.env` File (10 min)**

In your project directory, create `.env`:
```
SHOPIFY_STORE=madhudson.myshopify.com
SHOPIFY_API_TOKEN=shpat_xxx...
```

**Step 3: Verify `.env` is Protected (5 min)**
- [ ] Check `.gitignore` has `.env` (already does)
- [ ] Verify `.env` NOT committed to git
- [ ] Test: `git status` should NOT show `.env`

**Step 4: Get Your 6 Product IDs (20 min)**
- [ ] Go to Shopify Admin → Products
- [ ] Click each of 6 watches (Eddie, Marshall, Miami, Broken Time, CD Watch, Dogma)
- [ ] URL shows: `https://admin.shopify.com/store/madhudson/products/XXXXX`
- [ ] Copy all 6 IDs and save somewhere safe

**Step 5: Start GraphQL Script (1 hour)**
- [ ] Create file: `shopify_update_products.py`
- [ ] Copy code from PATH-B-IMPLEMENTATION-GUIDE.md (complete Python code provided)
- [ ] Verify file syntax (no errors)
- [ ] Install requests library: `pip3 install requests`

**End of Day FEB 10:** You have Shopify API access, `.env` file, product IDs, and GraphQL script ready.

---

### **FEB 11 (Tuesday) — 4 hours**

**Step 1: Test GraphQL Script (2 hours)**
- [ ] Create test file: `test_products.json` with 1 product (Eddie Watch)
- [ ] Run: `python3 shopify_update_products.py`
- [ ] Verify: Script runs without errors
- [ ] Check Shopify admin: Test product updated? ✓

**Step 2: Prepare Copywriter JSON Format (1 hour)**
- [ ] Create template: `COPYWRITER-JSON-TEMPLATE.md`
- [ ] Document exact format copywriter should provide
- [ ] Send to copywriter (they have until FEB 13)

**Step 3: Backup Current Theme (1 hour)**
- [ ] Shopify Admin → Online Store → Themes
- [ ] Find active theme
- [ ] Click "..." menu → Duplicate
- [ ] Name it: "Backup - Before Phase 1"
- [ ] Keep as backup (don't activate)

**End of Day FEB 11:** GraphQL script tested, copywriter format ready, theme backed up.

---

### **FEB 12 (Wednesday) — 3 hours**

**Step 1: Build Theme Schema Injection (2 hours)**
- [ ] Shopify Admin → Online Store → Themes → Active theme → Edit code
- [ ] Find `product.liquid` in file list
- [ ] Scroll to END of file (before closing tags)
- [ ] Paste schema injection code from PATH-B-IMPLEMENTATION-GUIDE.md
- [ ] Click "Save"

**Step 2: Test Schema Markup (1 hour)**
- [ ] Go to a product page on your store
- [ ] Right-click → View page source
- [ ] Search: `"@type": "Person"`
- [ ] Should find schema code in HTML ✓
- [ ] Go to: https://validator.schema.org/
- [ ] Paste schema JSON → should validate ✓

**End of Day FEB 12:** Theme schema injection deployed and tested.

---

### **FEB 13 (Thursday) — 3 hours**

**Step 1: Receive and Validate Copywriter JSON (30 min)**
- [ ] Copywriter delivers: `products.json`
- [ ] Validate JSON syntax: https://jsonlint.com/
- [ ] Verify: All 6 products present
- [ ] Check: Descriptions 500+ words each
- [ ] Check: Meta descriptions 155-160 chars

**Step 2: Full Integration Test (2 hours)**
- [ ] Copy `products.json` to project directory
- [ ] Run: `python3 shopify_update_products.py`
- [ ] Verify: All 6 products update successfully ✓
- [ ] Check Shopify: All descriptions correct? ✓
- [ ] Check schema: All products have schema? ✓
- [ ] Verify: No CSS/layout issues ✓

**Step 3: Pre-Production Checkpoint (30 min)**
- [ ] Verify `.env` file has correct credentials
- [ ] Test one more time (full run)
- [ ] Document any issues found
- [ ] Create rollback procedure (switch theme back if needed)

**End of Day FEB 13:** Everything tested and ready for production.

---

### **FEB 14 (Friday) — 1-2 hours**

**Step 1: Final Review (1 hour)**
- [ ] Review all code one more time
- [ ] Verify credentials in `.env`
- [ ] Test GraphQL script one final time
- [ ] Verify theme schema visible on staging products
- [ ] Second person reviews everything (if possible)

**Step 2: Prepare for Deployment (30 min)**
- [ ] Create deployment checklist (below)
- [ ] Document rollback steps
- [ ] Brief any team members on the plan
- [ ] Set calendar reminder for FEB 15 9am

**End of Day FEB 14:** Ready to deploy tomorrow.

---

### **FEB 15 (Saturday) — 15-30 min**

**Pre-Deployment (FEB 15 morning, 9am)**
- [ ] Double-check `.env` file has correct credentials
- [ ] Verify `products.json` still in project directory
- [ ] Copy credentials one more time (safety check)
- [ ] Note current time (for SEO Monitor)

**Deployment (FEB 15 morning, 9:15am)**
```bash
cd /Users/garen/Desktop/madhudson-seo-project
python3 shopify_update_products.py
```

**Expected Output:**
```
======================================================================
🚀 Mad Hudson Phase 1: Shopify Product Update
======================================================================

✅ Loaded 6 products from products.json

[1/6] Updating eddie-watch... ✅
[2/6] Updating marshall-watch... ✅
[3/6] Updating miami-watch... ✅
[4/6] Updating broken-time-watch... ✅
[5/6] Updating cd-watch... ✅
[6/6] Updating dogma-watch... ✅

======================================================================
📊 UPDATE SUMMARY
======================================================================

✅ Successful: 6/6
❌ Failed: 0/6

✅ ALL PRODUCTS UPDATED SUCCESSFULLY
======================================================================
```

**Post-Deployment (FEB 15, 9:30am)**
- [ ] Go to your store: https://madhudson.com (or similar)
- [ ] Click each of 6 products
- [ ] Verify: Descriptions updated? ✓
- [ ] Verify: Metadata looks good? ✓
- [ ] View page source → Search for schema → Found? ✓
- [ ] Take screenshots for before/after

**Notify Team (FEB 15, 10am)**
- [ ] Message SEO Monitor: "Phase 1 deployed, begin baseline capture"
- [ ] Message Content Planner: "Phase 1 live, artist schedule confirmed?"
- [ ] Message Press Outreach: "Assets ready for Phase 2?"

**Success Checkpoint:**
✅ All 6 products updated
✅ Descriptions 500+ words
✅ Metadata correct (H1, meta, alt text)
✅ Schema markup validates
✅ Phase 1 LIVE

---

## 📋 Resources You Need

**Primary Reference:**
- `PATH-B-IMPLEMENTATION-GUIDE.md` — Complete step-by-step with all code

**Background:**
- `PATH-DECISION-GUIDE-V2.html` — Why this path and what could go wrong
- `SHOPIFY-INTEGRATION-RISKS.md` — Risk mitigation strategies

**Code Templates:**
- Python script (in PATH-B-IMPLEMENTATION-GUIDE.md)
- Liquid schema injection (in PATH-B-IMPLEMENTATION-GUIDE.md)

---

## 🎯 Success Criteria

**By End of FEB 14:**
- [ ] GraphQL script works (tested on staging)
- [ ] Theme schema injection deployed (tested on staging)
- [ ] Copywriter JSON received and validated
- [ ] Full integration test passed
- [ ] Ready for production deployment

**By End of FEB 15:**
- [ ] All 6 products updated on production
- [ ] All descriptions 500+ words
- [ ] All metadata correct (H1, meta, alt text)
- [ ] Schema validation passes
- [ ] Phase 1 live and confirmed
- [ ] SEO Monitor notified (baseline capture begins)

---

## 🚨 If Something Goes Wrong

**GraphQL Script Errors:**
- Check `.env` file — credentials correct?
- Verify product IDs are exact
- Check API token hasn't expired
- Re-run with one product to isolate issue

**Theme Schema Issues:**
- Verify Liquid syntax correct (quotes, brackets)
- Check product.liquid isn't corrupted
- Rollback to backup theme if needed
- Try again on fresh backup

**Products Don't Update:**
- Check Shopify API rate limiting
- Verify products.json is valid JSON
- Confirm product IDs exist in Shopify
- Check Shopify error logs

---

## 📞 Keep This Handy

**Questions?**
- PATH-B-IMPLEMENTATION-GUIDE.md has complete details
- SHOPIFY-INTEGRATION-RISKS.md has troubleshooting
- All code is provided — no external dependencies

**Backup Plan:**
If code path fails, fall back to manual deployment (60 minutes on FEB 15). Not ideal, but Phase 1 still launches.

---

## 🎬 Start Now

**Next Action:** FEB 10, 9am
1. Open Shopify Admin
2. Create custom app (30 min)
3. Generate API token
4. Create `.env` file
5. Start GraphQL script

**Time to commit:** 2-3 hours today, and you're on your way.

**Timeline to victory:** 14 hours development (FEB 10-14) → Clean deployment Feb 15 → Baseline data collected Feb 17 → Results measured Apr 7

---

**Status:** 🟢 Path B Ready to Launch

**You've got this.**
