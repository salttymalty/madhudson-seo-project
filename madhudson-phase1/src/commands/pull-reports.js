#!/usr/bin/env node

/**
 * Mad Hudson: Batch Shopify Analytics Pull
 * Pulls session, order, and product data via GraphQL + ShopifyQL
 * Outputs CSV files to ../reports/ for analysis
 *
 * Usage: npm run pull-reports
 *        npm run pull-reports -- --days 60
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { createAdminApiClient } from '@shopify/admin-api-client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

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

const adminClient = createAdminApiClient({
  accessToken: SHOPIFY_ACCESS_TOKEN,
  storeDomain: SHOPIFY_SHOP,
  apiVersion: API_VERSION,
});

// Parse --days flag (default 30)
const daysArg = process.argv.find((a) => a.startsWith('--days'));
const DAYS = daysArg ? parseInt(daysArg.split('=')[1] || process.argv[process.argv.indexOf('--days') + 1] || '30') : 30;

const REPORTS_DIR = path.join(__dirname, '..', '..', 'reports');

// --- Utilities ---

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function toCsv(headers, rows) {
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

function writeReport(filename, csvContent) {
  const filepath = path.join(REPORTS_DIR, filename);
  fs.writeFileSync(filepath, csvContent, 'utf-8');
  console.log(chalk.green(`  -> ${filepath}`));
}

function dateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - DAYS);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    startISO: start.toISOString(),
    endISO: end.toISOString(),
  };
}

// --- ShopifyQL Reports (sessions data) ---

async function runShopifyQL(query) {
  const gql = `
    query {
      shopifyqlQuery(query: ${JSON.stringify(query)}) {
        __typename
        ... on TableResponse {
          tableData {
            columns { name dataType }
            rowData
          }
        }
        parseErrors { code message range { start { line character } } }
      }
    }
  `;

  try {
    const response = await adminClient.graphql(gql);
    const data = response.data;

    if (data.errors) {
      return { ok: false, error: JSON.stringify(data.errors) };
    }

    const result = data.shopifyqlQuery;

    if (result.parseErrors && result.parseErrors.length > 0) {
      return { ok: false, error: result.parseErrors.map((e) => e.message).join('; ') };
    }

    if (result.__typename !== 'TableResponse' || !result.tableData) {
      return { ok: false, error: `Unexpected response type: ${result.__typename}` };
    }

    const columns = result.tableData.columns.map((c) => c.name);
    const rows = result.tableData.rowData.map((row) => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });

    return { ok: true, columns, rows };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function pullSessionsByReferrer() {
  console.log(chalk.cyan('\n1. Sessions by referrer source...'));
  const result = await runShopifyQL(`
    FROM sessions
    SINCE -${DAYS}d UNTIL today
    GROUP BY referrer_source
    SHOW sum(sessions) AS total_sessions,
         sum(sessions_converted) AS converted_sessions
    ORDER BY total_sessions DESC
  `);

  if (!result.ok) {
    console.log(chalk.yellow(`  Skipped: ${result.error}`));
    return false;
  }

  writeReport(
    `sessions-by-referrer-${dateRange().start}-to-${dateRange().end}.csv`,
    toCsv(result.columns, result.rows)
  );
  return true;
}

async function pullSessionsByLocation() {
  console.log(chalk.cyan('\n2. Sessions by location...'));
  const result = await runShopifyQL(`
    FROM sessions
    SINCE -${DAYS}d UNTIL today
    GROUP BY country
    SHOW sum(sessions) AS total_sessions,
         sum(sessions_converted) AS converted_sessions
    ORDER BY total_sessions DESC
  `);

  if (!result.ok) {
    console.log(chalk.yellow(`  Skipped: ${result.error}`));
    return false;
  }

  writeReport(
    `sessions-by-country-${dateRange().start}-to-${dateRange().end}.csv`,
    toCsv(result.columns, result.rows)
  );
  return true;
}

async function pullSessionsByDevice() {
  console.log(chalk.cyan('\n3. Sessions by device type...'));
  const result = await runShopifyQL(`
    FROM sessions
    SINCE -${DAYS}d UNTIL today
    GROUP BY device_type
    SHOW sum(sessions) AS total_sessions,
         sum(sessions_converted) AS converted_sessions
    ORDER BY total_sessions DESC
  `);

  if (!result.ok) {
    console.log(chalk.yellow(`  Skipped: ${result.error}`));
    return false;
  }

  writeReport(
    `sessions-by-device-${dateRange().start}-to-${dateRange().end}.csv`,
    toCsv(result.columns, result.rows)
  );
  return true;
}

async function pullSessionsByLandingPage() {
  console.log(chalk.cyan('\n4. Sessions by landing page...'));
  const result = await runShopifyQL(`
    FROM sessions
    SINCE -${DAYS}d UNTIL today
    GROUP BY landing_page
    SHOW sum(sessions) AS total_sessions,
         sum(sessions_converted) AS converted_sessions
    ORDER BY total_sessions DESC
  `);

  if (!result.ok) {
    console.log(chalk.yellow(`  Skipped: ${result.error}`));
    return false;
  }

  writeReport(
    `sessions-by-landing-page-${dateRange().start}-to-${dateRange().end}.csv`,
    toCsv(result.columns, result.rows)
  );
  return true;
}

async function pullDailySessions() {
  console.log(chalk.cyan('\n5. Daily session breakdown...'));
  const result = await runShopifyQL(`
    FROM sessions
    SINCE -${DAYS}d UNTIL today
    GROUP BY day
    SHOW sum(sessions) AS total_sessions,
         sum(sessions_converted) AS converted_sessions,
         sum(sessions_with_cart_addition) AS cart_adds
    ORDER BY day ASC
  `);

  if (!result.ok) {
    console.log(chalk.yellow(`  Skipped: ${result.error}`));
    return false;
  }

  writeReport(
    `sessions-daily-${dateRange().start}-to-${dateRange().end}.csv`,
    toCsv(result.columns, result.rows)
  );
  return true;
}

// --- GraphQL Reports (orders + products — universally available) ---

async function pullOrders() {
  console.log(chalk.cyan('\n6. Orders (last ' + DAYS + ' days)...'));

  const { startISO } = dateRange();
  let allOrders = [];
  let cursor = null;
  let hasMore = true;

  while (hasMore) {
    const afterClause = cursor ? `, after: "${cursor}"` : '';
    const query = `
      {
        orders(first: 50, query: "created_at:>=${startISO}"${afterClause}, sortKey: CREATED_AT) {
          edges {
            cursor
            node {
              id
              name
              createdAt
              totalPriceSet { shopMoney { amount currencyCode } }
              subtotalPriceSet { shopMoney { amount currencyCode } }
              totalShippingPriceSet { shopMoney { amount currencyCode } }
              totalTaxSet { shopMoney { amount currencyCode } }
              displayFinancialStatus
              displayFulfillmentStatus
              cancelledAt
              refunds { id }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    originalUnitPriceSet { shopMoney { amount currencyCode } }
                    product { handle }
                  }
                }
              }
              shippingAddress { city provinceCode country countryCodeV2 }
              customerLocale
              referrerDisplayText
            }
          }
          pageInfo { hasNextPage }
        }
      }
    `;

    try {
      const response = await adminClient.graphql(query);
      const data = response.data;

      if (data.errors) {
        console.log(chalk.yellow(`  Warning: ${JSON.stringify(data.errors)}`));
        break;
      }

      const edges = data.orders?.edges || [];
      for (const edge of edges) {
        const o = edge.node;
        const lineItems = o.lineItems?.edges?.map((e) => e.node) || [];

        for (const item of lineItems) {
          allOrders.push({
            order_name: o.name,
            created_at: o.createdAt.split('T')[0],
            product_title: item.title,
            product_handle: item.product?.handle || '',
            quantity: item.quantity,
            unit_price: item.originalUnitPriceSet?.shopMoney?.amount || '',
            currency: item.originalUnitPriceSet?.shopMoney?.currencyCode || '',
            order_total: o.totalPriceSet?.shopMoney?.amount || '',
            subtotal: o.subtotalPriceSet?.shopMoney?.amount || '',
            shipping: o.totalShippingPriceSet?.shopMoney?.amount || '',
            tax: o.totalTaxSet?.shopMoney?.amount || '',
            financial_status: o.displayFinancialStatus,
            fulfillment_status: o.displayFulfillmentStatus,
            cancelled: o.cancelledAt ? 'yes' : 'no',
            refunded: o.refunds?.length > 0 ? 'yes' : 'no',
            city: o.shippingAddress?.city || '',
            state: o.shippingAddress?.provinceCode || '',
            country: o.shippingAddress?.countryCodeV2 || '',
            locale: o.customerLocale || '',
            referrer: o.referrerDisplayText || '',
          });
        }

        cursor = edge.cursor;
      }

      hasMore = data.orders?.pageInfo?.hasNextPage || false;

      // Rate limit
      if (hasMore) await new Promise((r) => setTimeout(r, 500));
    } catch (error) {
      console.log(chalk.yellow(`  Warning: ${error.message}`));
      break;
    }
  }

  if (allOrders.length === 0) {
    console.log(chalk.yellow('  No orders found in this period.'));
    return false;
  }

  const headers = [
    'order_name', 'created_at', 'product_title', 'product_handle',
    'quantity', 'unit_price', 'currency', 'order_total', 'subtotal',
    'shipping', 'tax', 'financial_status', 'fulfillment_status',
    'cancelled', 'refunded', 'city', 'state', 'country', 'locale', 'referrer',
  ];

  writeReport(
    `orders-${dateRange().start}-to-${dateRange().end}.csv`,
    toCsv(headers, allOrders)
  );
  return true;
}

async function pullProducts() {
  console.log(chalk.cyan('\n7. Product catalog snapshot...'));

  let allProducts = [];
  let cursor = null;
  let hasMore = true;

  while (hasMore) {
    const afterClause = cursor ? `, after: "${cursor}"` : '';
    const query = `
      {
        products(first: 50${afterClause}) {
          edges {
            cursor
            node {
              id
              title
              handle
              status
              productType
              vendor
              createdAt
              updatedAt
              totalInventory
              onlineStoreUrl
              descriptionHtml
              seo { title description }
              variants(first: 5) {
                edges {
                  node {
                    title
                    price
                    inventoryQuantity
                    sku
                  }
                }
              }
              images(first: 1) {
                edges {
                  node { altText url }
                }
              }
            }
          }
          pageInfo { hasNextPage }
        }
      }
    `;

    try {
      const response = await adminClient.graphql(query);
      const data = response.data;

      if (data.errors) {
        console.log(chalk.yellow(`  Warning: ${JSON.stringify(data.errors)}`));
        break;
      }

      const edges = data.products?.edges || [];
      for (const edge of edges) {
        const p = edge.node;
        const variant = p.variants?.edges?.[0]?.node || {};
        const image = p.images?.edges?.[0]?.node || {};
        const descLength = (p.descriptionHtml || '').replace(/<[^>]*>/g, '').length;

        allProducts.push({
          handle: p.handle,
          title: p.title,
          status: p.status,
          product_type: p.productType || '',
          price: variant.price || '',
          sku: variant.sku || '',
          inventory: p.totalInventory,
          seo_title: p.seo?.title || '',
          seo_description: p.seo?.description || '',
          description_word_count: descLength,
          has_alt_text: image.altText ? 'yes' : 'no',
          image_alt_text: image.altText || '',
          url: p.onlineStoreUrl || '',
          created: p.createdAt?.split('T')[0] || '',
          updated: p.updatedAt?.split('T')[0] || '',
        });

        cursor = edge.cursor;
      }

      hasMore = data.products?.pageInfo?.hasNextPage || false;
      if (hasMore) await new Promise((r) => setTimeout(r, 500));
    } catch (error) {
      console.log(chalk.yellow(`  Warning: ${error.message}`));
      break;
    }
  }

  if (allProducts.length === 0) {
    console.log(chalk.yellow('  No products found.'));
    return false;
  }

  const headers = [
    'handle', 'title', 'status', 'product_type', 'price', 'sku',
    'inventory', 'seo_title', 'seo_description', 'description_word_count',
    'has_alt_text', 'image_alt_text', 'url', 'created', 'updated',
  ];

  writeReport(
    `products-snapshot-${dateRange().end}.csv`,
    toCsv(headers, allProducts)
  );
  return true;
}

// --- Main ---

async function main() {
  const { start, end } = dateRange();

  console.log(chalk.cyan.bold('\n' + '='.repeat(60)));
  console.log(chalk.cyan.bold('Mad Hudson: Shopify Analytics Pull'));
  console.log(chalk.cyan.bold('='.repeat(60)));
  console.log(chalk.cyan(`Store: ${SHOPIFY_SHOP}`));
  console.log(chalk.cyan(`Period: ${start} to ${end} (${DAYS} days)`));
  console.log(chalk.cyan(`Output: ${REPORTS_DIR}/`));
  console.log(chalk.cyan.bold('='.repeat(60)));

  ensureDir(REPORTS_DIR);

  const results = {
    shopifyql: 0,
    graphql: 0,
    skipped: 0,
  };

  // ShopifyQL reports (session analytics — may not be available on all plans)
  console.log(chalk.cyan.bold('\n--- Session Analytics (ShopifyQL) ---'));
  console.log(chalk.dim('  Note: Requires Shopify Analytics access. Reports will'));
  console.log(chalk.dim('  skip gracefully if your plan doesn\'t support ShopifyQL.\n'));

  const sessionReports = [
    pullSessionsByReferrer,
    pullSessionsByLocation,
    pullSessionsByDevice,
    pullSessionsByLandingPage,
    pullDailySessions,
  ];

  for (const report of sessionReports) {
    const ok = await report();
    if (ok) results.shopifyql++;
    else results.skipped++;
    await new Promise((r) => setTimeout(r, 300));
  }

  // GraphQL reports (universally available)
  console.log(chalk.cyan.bold('\n--- Order & Product Data (GraphQL) ---'));

  const graphqlReports = [pullOrders, pullProducts];

  for (const report of graphqlReports) {
    const ok = await report();
    if (ok) results.graphql++;
    else results.skipped++;
    await new Promise((r) => setTimeout(r, 300));
  }

  // Summary
  console.log(chalk.cyan.bold('\n' + '='.repeat(60)));
  console.log(chalk.cyan('Results:'));
  console.log(chalk.green(`  ${results.shopifyql} ShopifyQL reports exported`));
  console.log(chalk.green(`  ${results.graphql} GraphQL reports exported`));
  if (results.skipped > 0) {
    console.log(chalk.yellow(`  ${results.skipped} reports skipped (see warnings above)`));
  }
  console.log(chalk.cyan(`\nAll reports saved to: ${REPORTS_DIR}/`));
  console.log(chalk.cyan.bold('='.repeat(60) + '\n'));

  if (results.shopifyql === 0 && results.graphql === 0) {
    console.log(chalk.red('No reports exported. Check your API credentials and permissions.'));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(chalk.red('FATAL ERROR:'), error);
  process.exit(1);
});
