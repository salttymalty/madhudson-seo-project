# Path B Node.js Setup Guide
**Complete setup for FEB 10 morning**

---

## 🚀 FEB 10 Morning: 5-Step Setup (1 hour)

### **Step 1: Verify Node.js (5 min)**

```bash
node --version
# Should return v18.0.0 or higher

npm --version
# Should return 8.0.0 or higher
```

If not installed, download from https://nodejs.org/

---

### **Step 2: Install Dependencies (10 min)**

```bash
cd ~/Desktop/madhudson-seo-project/madhudson-phase1

npm install
# This installs all required packages:
# - @shopify/admin-api-client (GraphQL API)
# - chalk (colored output)
# - dotenv (environment variables)
# - inquirer (interactive prompts)
```

---

### **Step 3: Generate Shopify Credentials (15 min)**

```bash
npm run shopify app generate-credentials
```

This will:
1. Open your browser
2. Ask you to select your Shopify store
3. Create a custom app named "madhudson-phase1"
4. Generate API access token
5. Automatically save to `.env` file

**Watch for the output:**
```
✓ Created custom app: madhudson-phase1
✓ API credentials saved to .env

SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx
SHOPIFY_SHOP=madhudson.myshopify.com
```

---

### **Step 4: Verify Connection (5 min)**

```bash
npm run shopify api query '{shop {name}}'
```

**Success:** Returns your store name
```json
{
  "data": {
    "shop": {
      "name": "Mad Hudson"
    }
  }
}
```

---

### **Step 5: Validate Setup (10 min)**

```bash
npm run validate
```

This checks:
- ✅ Credentials loaded correctly
- ✅ Product data ready
- ✅ Security (.env protected)
- ✅ Pre-deployment checklist
- ⚠️  Risk assessment

**Output should show:** ✅ READY FOR DEPLOYMENT

---

## ✅ After Setup: What to Do FEB 10 Afternoon

```bash
# Fill in your product data
cd ~/Desktop/madhudson-seo-project/madhudson-phase1
nano products-to-update.json

# Edit the 6 products:
# 1. Replace placeholder text with real artist names
# 2. Replace [Full narrative] with 500-1000 word descriptions
# 3. Update meta descriptions (155-160 chars)
# 4. Update artist bios

# Save and exit (Ctrl+X in nano)
```

---

## 🧪 Optional: Test on Staging (FEB 12)

If you have a Shopify staging store:

```bash
# 1. Get staging store API token
# 2. Update .env with staging credentials:

cat >> .env << 'EOF'
SHOPIFY_STAGING_STORE="madhudson-staging.myshopify.com"
SHOPIFY_STAGING_TOKEN="shpat_staging_token_here"
EOF

# 3. Test the script:
npm run update-products
```

Verify in Shopify staging store before deploying to production.

---

## 🚀 Deployment: FEB 15 Morning

```bash
cd ~/Desktop/madhudson-seo-project/madhudson-phase1

# Final validation
npm run validate
# Should show: ✅ READY FOR DEPLOYMENT

# Run the update
npm run update-products

# Expected output:
# ======================================================================
# Mad Hudson Phase 1: Shopify Product Update
# ======================================================================
# Processing: eddie-watch... ✅ UPDATED
# Processing: marshall-watch... ✅ UPDATED
# ...
# Results: 6 updated, 0 failed
# ======================================================================
# ✅ All products updated successfully!
```

---

## 🔐 Security Checklist

- [ ] `.env` file created (auto, by Shopify CLI)
- [ ] `.env` is in `.gitignore` (auto)
- [ ] Never commit `.env` to git
- [ ] Credentials use minimal scopes (write_products only)
- [ ] Store API token safely

---

## 📚 File Structure

```
madhudson-phase1/
├── package.json          ← Dependencies + scripts
├── .env                  ← Credentials (auto-created)
├── .env.template         ← Template (reference only)
├── .gitignore            ← Protects .env
├── products-to-update.json  ← EDIT THIS with your data
├── README.md             ← Quick reference
├── SETUP.md              ← This file
└── src/
    ├── index.js          ← Entry point
    └── commands/
        ├── update-products.js     ← Main script
        └── validate-deployment.js ← Pre-flight checks
```

---

## 🆘 Troubleshooting

### "npm: command not found"
- Node.js not installed
- Download from https://nodejs.org/

### "ERROR: SHOPIFY_ACCESS_TOKEN and SHOPIFY_SHOP required in .env"
- Run: `npm run shopify app generate-credentials`
- Verify `.env` file created in this directory

### "ERROR: products-to-update.json not found"
- File is already here, but you haven't filled it in yet
- Edit it: `nano products-to-update.json`

### "ERROR: product not found"
- Product handle doesn't exist in your Shopify store
- Check product URLs in Shopify admin
- Update `products-to-update.json` with correct handles

### Script fails but no clear error
- Run validation first: `npm run validate`
- Check error output above
- Compare your product data to template

---

## 📞 Next Steps

1. ✅ Run FEB 10 morning setup (follow steps 1-5 above)
2. Fill in `products-to-update.json` FEB 10-11
3. Run `npm run validate` FEB 14
4. Deploy with `npm run update-products` FEB 15

---

## 📖 Full Documentation

See: `PATH-B-NODE.JS-GUIDE.md` for complete guide

---

**Ready? Start with Step 1 above.**
