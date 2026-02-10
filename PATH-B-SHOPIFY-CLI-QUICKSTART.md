# Path B: Shopify CLI Quick-Start
**Use Shopify CLI to Skip Manual Setup Steps (FEB 10, 30 min instead of 2 hours)**

---

## 🎯 What This Does

Replaces Steps 1-2 from the main guide with **3 CLI commands**:
- Create custom app
- Generate API credentials
- Set up `.env` automatically

**Time savings:** 90 minutes (vs. manual setup)

---

## 📋 Prerequisites

- [ ] Shopify CLI installed (`brew install shopify-cli` on Mac)
- [ ] Shopify store admin access
- [ ] Terminal/command-line open

**Not installed?** Install first:
```bash
# Mac
brew install shopify-cli

# Or download: https://shopify.dev/docs/api/admin-rest/2024-01/getting-started
```

Verify installation:
```bash
shopify version
# Should return version number (e.g., 3.50.0)
```

---

## 🚀 FEB 10: Shopify CLI Setup (30 minutes)

### **Step 1: Connect to Your Store**

```bash
cd ~/Desktop/madhudson-seo-project
shopify app init
```

This will prompt you:
```
? App name: Mad Hudson SEO Phase 1
? App type: (Choose: public)
```

Select your store when prompted:
```
? Which store would you like to work on?
→ madhudson.myshopify.com
```

**Result:** Creates `shopify.app.toml` (ignore this for now)

---

### **Step 2: Create Access Token via CLI**

```bash
shopify app generate-credentials
```

This will:
1. Create a new custom app in your store
2. Generate an access token automatically
3. Display the token in terminal

**Output will look like:**
```
✓ Created custom app: Mad Hudson SEO Phase 1
✓ API credentials generated

Access Token: shpat_xxxxxxxxxxxxxxxxxxxxxxxx
Store: madhudson.myshopify.com
Scopes: write_products, read_products
```

**Copy the token immediately** (you only see it once)

---

### **Step 3: Create `.env` File Automatically**

Instead of manually creating `.env`, use this command:

```bash
cat > .env << 'EOF'
SHOPIFY_STORE="madhudson.myshopify.com"
SHOPIFY_API_TOKEN="shpat_paste_the_token_from_above_here"
SHOPIFY_API_VERSION="2024-01"
EOF
```

Then verify:
```bash
cat .env
# Should show your credentials
```

**Verify `.env` is in `.gitignore`:**
```bash
cat .gitignore | grep "\.env"
# Should return: .env
```

---

### **Step 4: Test the Connection**

```bash
shopify api query '{shop {name}}'
```

**Success looks like:**
```
{
  "data": {
    "shop": {
      "name": "Mad Hudson"
    }
  }
}
```

If you get this, your API token works! ✅

---

## 🎨 Bonus: Theme Management with CLI

### **If You Want to Edit Theme via CLI**

Instead of manually accessing theme files in Shopify Admin:

```bash
# List all themes
shopify theme list

# Open theme in editor
shopify theme pull
# Downloads theme to local directory

# Edit product.liquid
nano theme/layout/product.liquid
# Add schema markup (see main guide, Step 5)

# Push changes back to Shopify
shopify theme push
```

This is optional - you can still edit theme manually in Shopify Admin if you prefer.

---

## 📝 Verify Everything Works

After CLI setup, verify your GraphQL script will work:

```bash
# Test your API token with GraphQL query
shopify api query '{products(first: 1) {edges {node {id title handle}}}}'
```

**Success:** Returns at least one product

This confirms your token works for the GraphQL script in Step 3.

---

## ⏱️ Timeline Comparison

### **Manual Setup (Original Steps 1-2)**
```
STEP 1a-1d: Create Shopify app         30 min
STEP 1e: Get API endpoint              15 min
STEP 2: Create .env file               15 min
Total: 60 minutes
```

### **With Shopify CLI (This Guide)**
```
Install Shopify CLI (one-time)         10 min
shopify app init                        5 min
shopify app generate-credentials       5 min
Create .env via CLI                    5 min
Test connection                        5 min
Total: 30 minutes (one-time install)
```

**Savings: 30 minutes on FEB 10**

---

## 📁 File Structure After CLI Setup

```
~/Desktop/madhudson-seo-project/
├── .env (your credentials)
├── shopify.app.toml (created by CLI, keep it)
├── products-to-update.json (from Step 4, main guide)
└── scripts/
    └── update_shopify_products.py (from Step 3, main guide)
```

---

## 🔐 Security with Shopify CLI

Shopify CLI automatically:
- ✅ Stores token securely
- ✅ Creates custom app with minimal scopes
- ✅ Rotates tokens if requested
- ✅ Validates permissions

**Additional security:**
```bash
# To revoke token if needed
shopify app delete
# (Deletes the custom app entirely)
```

---

## 🎯 Next Steps After CLI Setup

Once CLI setup is done (still FEB 10):

1. ✅ You have API credentials in `.env`
2. ✅ You can run the GraphQL script (Step 3 in main guide)
3. → Continue with Step 3: **Build GraphQL API Script** (main guide)
4. → Step 4: **Create Product Data JSON**
5. → etc.

---

## 📚 Reference: Useful Shopify CLI Commands

```bash
# Check if you're authenticated
shopify auth status

# List all products
shopify api query '{products(first: 10) {edges {node {id title}}}}'

# Run a GraphQL mutation
shopify api mutation 'mutation { productUpdate(input: {id: "gid://shopify/Product/123", title: "New Title"}) { product { id title } } }'

# Check theme status
shopify theme list

# See CLI version
shopify version

# Get help
shopify help
shopify app help
shopify theme help
```

---

## ⚠️ If You Already Started Manual Setup

No problem:

1. **Delete the manual `.env`** you created
2. **Run `shopify app init`** (creates new custom app)
3. **Run `shopify app generate-credentials`** (gets token)
4. **Create `.env` via CLI command** above
5. **Continue with main guide Step 3**

The Shopify CLI approach is cleaner - start fresh with it.

---

## 🚀 The Fast Path (FEB 10 Morning)

```bash
# 1. Install Shopify CLI (one-time)
brew install shopify-cli

# 2. Go to project directory
cd ~/Desktop/madhudson-seo-project

# 3. Initialize app (choose your store)
shopify app init

# 4. Generate credentials
shopify app generate-credentials
# (Copy the token when it appears)

# 5. Create .env
cat > .env << 'EOF'
SHOPIFY_STORE="madhudson.myshopify.com"
SHOPIFY_API_TOKEN="shpat_your_token_here"
SHOPIFY_API_VERSION="2024-01"
EOF

# 6. Test it works
shopify api query '{shop {name}}'

# Done! Now continue with Step 3 in main guide
```

**Total time: 30 minutes** ✅

---

## 📖 Full Path B Timeline (Updated)

| Date | Task | Time | Using |
|------|------|------|-------|
| **FEB 10 (Mon)** | Shopify CLI setup | 30 min | This guide |
| **FEB 10 (Mon)** | GraphQL script | 5-6 hrs | Main guide Step 3 |
| **FEB 11 (Tue)** | Finish GraphQL + test | 2 hrs | Main guide |
| **FEB 12 (Wed)** | Theme schema | 3 hrs | Main guide Step 5 |
| **FEB 13 (Thu)** | Testing | 2 hrs | Main guide Step 6 |
| **FEB 14 (Fri)** | Verification | 1 hr | Main guide Step 7 |
| **FEB 15 (Sat)** | Deploy | 15 min | Main guide Step 8 |

**Total: 13.5 hours (30 min faster than original path)**

---

## ✅ Done with CLI Setup?

Once you complete this guide:

1. ✅ `.env` has your API credentials
2. ✅ You've tested the connection works
3. ✅ You can run the GraphQL script

**Next:** Open `PATH-B-IMPLEMENTATION-GUIDE.md` and start **STEP 3: Build GraphQL API Script**

Skip STEP 1-2 (you just did them with CLI).

---

## 🎯 Key Difference from Main Guide

| Step | Main Guide | CLI Quickstart |
|------|-----------|---|
| Create custom app | Manual Shopify Admin | `shopify app init` |
| Generate token | Manual copy-paste | `shopify app generate-credentials` |
| Create `.env` | Manual text edit | CLI `cat` command |
| Test connection | Manual | `shopify api query` |
| **Time** | 60 min | 30 min |

---

**Ready? Start Shopify CLI setup on FEB 10 morning, then continue with main guide Step 3.**
