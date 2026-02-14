#!/usr/bin/env node

/**
 * Mad Hudson Phase 1: Shopify Product Update via GraphQL
 * Updates 6 products with artist narratives + metadata
 *
 * Usage: npm run update-products
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { createAdminApiClient } from '@shopify/admin-api-client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-01';

if (!SHOPIFY_ACCESS_TOKEN || !SHOPIFY_SHOP) {
  console.error(
    chalk.red('ERROR: SHOPIFY_ACCESS_TOKEN and SHOPIFY_SHOP required in .env')
  );
  process.exit(1);
}

// Initialize Shopify Admin API client
const adminClient = createAdminApiClient({
  accessToken: SHOPIFY_ACCESS_TOKEN,
  storeDomain: SHOPIFY_SHOP,
  apiVersion: API_VERSION,
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
      console.error(
        chalk.red(`ERROR fetching product ${handle}:`),
        data.errors
      );
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
  console.log(
    chalk.cyan(
      `Results: ${chalk.green(updated)} updated, ${chalk.red(failed)} failed`
    )
  );
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
