# Mad Hudson Phase 1: Shopify Product Updates

Automated GraphQL script to update 6 Shopify products with artist narratives and metadata.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Shopify API Credentials

```bash
npm run shopify app generate-credentials
```

This will:
- Create a custom app in your Shopify store
- Generate an API access token
- Automatically save to `.env`

### 3. Verify Connection

```bash
npm run shopify api query '{shop {name}}'
```

Should return your store name.

## Update Products

### 1. Fill in Product Data

Edit `products-to-update.json` with:
- Expanded product descriptions (500-1000 words)
- Artist narratives
- Meta descriptions
- Artist names and bios

### 2. Run Update Script

```bash
npm run update-products
```

Expected output:
```
======================================================================
Mad Hudson Phase 1: Shopify Product Update
======================================================================
Store: madhudson.myshopify.com
Products to update: 6
======================================================================

Processing: eddie-watch... ✅ UPDATED
Processing: marshall-watch... ✅ UPDATED
...
Results: 6 updated, 0 failed
======================================================================
✅ All products updated successfully!
```

## Files

- `package.json` — Dependencies and scripts
- `src/commands/update-products.js` — GraphQL update script
- `products-to-update.json` — Product data (edit this)
- `.env` — Shopify credentials (auto-generated, never commit)
- `.env.template` — Template for .env

## Security

- `.env` contains API credentials — NEVER commit to git
- `.gitignore` excludes .env automatically
- Use minimal API scopes (write_products only)
- Rotate credentials quarterly

## Troubleshooting

### "ERROR: SHOPIFY_ACCESS_TOKEN and SHOPIFY_SHOP required in .env"
- Run: `npm run shopify app generate-credentials`
- Verify `.env` file exists with credentials

### "ERROR: product not found"
- Check product handle spelling in `products-to-update.json`
- Verify product exists in Shopify store

### "Some products failed"
- Check error messages above
- Verify product data is valid JSON
- Ensure descriptions are proper HTML (escape quotes)

## API Rate Limiting

Script includes 500ms delay between requests to prevent API throttling.
Don't remove the `time.sleep(0.5)` delay.

## Timeline

- **FEB 10:** Setup + credentials (30 min)
- **FEB 10-11:** Fill in product data + test (6+ hours)
- **FEB 12:** Add theme schema markup (3 hours)
- **FEB 13:** Final testing (2 hours)
- **FEB 14:** Pre-deployment checklist (1 hour)
- **FEB 15:** Deploy (15 min) → `npm run update-products`

## Next Steps

1. Run `npm install` ✅
2. Run `npm run shopify app generate-credentials` (your credentials auto-saved)
3. Edit `products-to-update.json` with real data
4. Run `npm run update-products` to test
5. Verify products updated in Shopify
6. Add theme schema markup (separate step)
7. Deploy on FEB 15

## Questions?

See `PATH-B-NODE.JS-GUIDE.md` for complete documentation.
