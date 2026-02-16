# Shopify Update Quick Start (For Connor & Team)

Before updating products in Shopify, run these three commands in order.

## The Safe Way to Update Products

```bash
# 1. Test your connection (first time only)
python3 scripts/test_update.py

# 2. Validate your product data
python3 scripts/validate_products.py

# 3. Test run without making changes
python3 scripts/update_shopify_products.py --dry-run

# 4. Actually update the products
python3 scripts/update_shopify_products.py
```

## What Each Script Does

| Script | What It Checks | When to Use |
|--------|----------------|-------------|
| `test_update.py` | API connection, credentials | First time, or if you get connection errors |
| `validate_products.py` | Product data quality | Before every update |
| `update_shopify_products.py --dry-run` | Products exist in Shopify | Before every update |
| `update_shopify_products.py` | Actually updates products | When everything above passes |

## Common Validation Errors

### "Meta description too short"
Your meta description needs to be **155-160 characters** (not words).

**Bad:** "Artist-designed watch" (21 chars)
**Good:** "Brad Podray's Eddie Watch: Artist-designed, limited edition pre-order collaboration with Mad Hudson. Where creative culture meets functional design." (158 chars)

### "Body too short"
Your product description needs **at least 500 words**.

Use the full artist narrative, not just a quick blurb.

### "Contains placeholder content"
Look for things like:
- `[Artist Name]` - replace with actual artist name
- `[full narrative]` - replace with actual content
- `TODO` or `FIXME` - complete the content

### "Product not found in Shopify"
The `handle` in your JSON doesn't match what's in Shopify.

Check: Shopify Admin → Products → Your product → "Search engine listing" section

## Red Flags to Watch For

Before you update, the validator will warn you about:
- Missing image alt text (bad for SEO and accessibility)
- Weird product handles (should be lowercase with hyphens)
- Placeholder content you forgot to replace

Warnings won't block the update, but you should fix them.

## Safety Features

1. **Validation runs automatically** - The update script runs validation first
2. **Dry run mode** - See what would happen without changing anything
3. **Rate limiting** - Won't overwhelm Shopify's API
4. **Clear errors** - Tells you exactly what to fix

## If Something Goes Wrong

**"Authentication failed"**
- Check your `.env` file has the right API token
- Token might be expired - generate a new one in Shopify

**"Product not found"**
- Double-check the product handle in your JSON
- Make sure the product exists in Shopify

**"Validation failed"**
- Read the error message - it tells you exactly what to fix
- Fix the issues in `products-to-update.json`
- Run validation again

## First Time Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your credentials:
   ```
   SHOPIFY_STORE="madhudson-staging.myshopify.com"
   SHOPIFY_API_TOKEN="your_actual_token_here"
   SHOPIFY_API_VERSION="2024-01"
   ```

3. Test your connection:
   ```bash
   python3 scripts/test_update.py
   ```

4. You're ready to go!

## Need Help?

1. Read the error message (they're designed to be clear)
2. Check `scripts/README.md` for detailed documentation
3. Run `test_update.py` to diagnose connection issues
4. Run `validate_products.py` to check your data

The scripts are designed so you don't need a developer to use them.
