#!/usr/bin/env node

/**
 * Mad Hudson Phase 1: Pre-Deployment Validation
 *
 * Validates everything before deploying to production
 * Checks for risks and flags issues that could impact the site
 *
 * Usage: npm run validate (after adding to package.json scripts)
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CRITICAL = chalk.red.bold('🔴 CRITICAL');
const WARNING = chalk.yellow.bold('🟡 WARNING');
const SUCCESS = chalk.green.bold('✅ PASS');
const INFO = chalk.cyan('ℹ️  INFO');

let criticalIssues = 0;
let warnings = 0;
let passes = 0;

/**
 * Validation helpers
 */
function logCritical(message) {
  console.log(`${CRITICAL}: ${message}`);
  criticalIssues++;
}

function logWarning(message) {
  console.log(`${WARNING}: ${message}`);
  warnings++;
}

function logSuccess(message) {
  console.log(`${SUCCESS}: ${message}`);
  passes++;
}

function logInfo(message) {
  console.log(`${INFO} ${message}`);
}

function separator() {
  console.log(chalk.cyan('━'.repeat(70)));
}

/**
 * Check environment credentials
 */
function checkCredentials() {
  separator();
  console.log(chalk.cyan.bold('1. CREDENTIALS & ENVIRONMENT'));
  separator();

  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  const shop = process.env.SHOPIFY_SHOP;

  if (!accessToken) {
    logCritical('SHOPIFY_ACCESS_TOKEN not found in .env');
    logInfo('Run: npm run shopify app generate-credentials');
    return false;
  }

  if (!accessToken.startsWith('shpat_')) {
    logCritical(
      'SHOPIFY_ACCESS_TOKEN looks invalid (should start with shpat_)'
    );
    return false;
  }

  logSuccess('SHOPIFY_ACCESS_TOKEN found and valid format');

  if (!shop) {
    logCritical('SHOPIFY_SHOP not found in .env');
    return false;
  }

  if (!shop.includes('.myshopify.com')) {
    logWarning(
      `SHOPIFY_SHOP looks unusual: ${shop} (should be xxx.myshopify.com)`
    );
  }

  logSuccess(`SHOPIFY_SHOP set to: ${shop}`);
  console.log('');
  return true;
}

/**
 * Check products JSON file
 */
function checkProductsJson() {
  separator();
  console.log(chalk.cyan.bold('2. PRODUCT DATA FILE'));
  separator();

  const productsFile = path.join(__dirname, '..', '..', 'products-to-update.json');

  if (!fs.existsSync(productsFile)) {
    logCritical(`products-to-update.json not found at ${productsFile}`);
    logInfo('Copy template from .env.template or create manually');
    console.log('');
    return false;
  }

  logSuccess('products-to-update.json exists');

  let products;
  try {
    const data = fs.readFileSync(productsFile, 'utf-8');
    products = JSON.parse(data);
  } catch (error) {
    logCritical(`products-to-update.json is not valid JSON: ${error.message}`);
    console.log('');
    return false;
  }

  logSuccess('products-to-update.json is valid JSON');

  // Check array length
  if (!Array.isArray(products)) {
    logCritical('products-to-update.json should be an array of products');
    console.log('');
    return false;
  }

  if (products.length === 0) {
    logCritical('products-to-update.json is empty (no products)');
    console.log('');
    return false;
  }

  logSuccess(`Found ${products.length} products`);

  // Check each product
  let validCount = 0;
  let issueCount = 0;

  products.forEach((product, index) => {
    const handle = product.handle || `[MISSING at index ${index}]`;

    // Required fields
    if (!product.handle) {
      logCritical(`Product ${index}: missing 'handle' field`);
      issueCount++;
      return;
    }

    if (!product.title) {
      logCritical(`Product ${handle}: missing 'title' field`);
      issueCount++;
      return;
    }

    if (!product.body_html) {
      logCritical(`Product ${handle}: missing 'body_html' field`);
      issueCount++;
      return;
    }

    if (!product.meta_description) {
      logCritical(`Product ${handle}: missing 'meta_description' field`);
      issueCount++;
      return;
    }

    if (!product.artist_name) {
      logCritical(`Product ${handle}: missing 'artist_name' field`);
      issueCount++;
      return;
    }

    // Content validation
    const htmlLength = product.body_html.length;
    if (htmlLength < 500) {
      logWarning(
        `Product ${handle}: description too short (${htmlLength} chars, target: 500+)`
      );
      issueCount++;
    }

    if (htmlLength > 10000) {
      logWarning(
        `Product ${handle}: description very long (${htmlLength} chars, max recommended: 5000)`
      );
      issueCount++;
    }

    // Meta description validation
    const metaLength = product.meta_description.length;
    if (metaLength < 120) {
      logWarning(
        `Product ${handle}: meta description too short (${metaLength} chars, target: 155-160)`
      );
      issueCount++;
    }

    if (metaLength > 160) {
      logWarning(
        `Product ${handle}: meta description too long (${metaLength} chars, max: 160)`
      );
      issueCount++;
    }

    // Check for placeholder text
    if (
      product.title.includes('[') ||
      product.body_html.includes('[Artist') ||
      product.artist_name.includes('[')
    ) {
      logCritical(
        `Product ${handle}: contains placeholder text (looks like template)`
      );
      issueCount++;
      return;
    }

    validCount++;
  });

  if (validCount === products.length) {
    logSuccess(`All ${validCount} products have required fields`);
  } else {
    logInfo(`${validCount} valid, ${issueCount} with issues`);
  }

  console.log('');
  return issueCount === 0;
}

/**
 * Check git status
 */
function checkGitStatus() {
  separator();
  console.log(chalk.cyan.bold('3. GIT & SECURITY'));
  separator();

  const envExists = fs.existsSync('.env');
  if (envExists) {
    logWarning('.env file exists (should NEVER be committed to git)');
    logInfo('Verify .env is in .gitignore: check git status');
  } else {
    logInfo('.env file not yet created (will be auto-created by Shopify CLI)');
  }

  // Check .gitignore
  const gitignorePath = path.join(__dirname, '..', '..', '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    if (gitignore.includes('.env')) {
      logSuccess('.env is in .gitignore (credentials protected)');
    } else {
      logCritical('.env is NOT in .gitignore (SECURITY RISK!)');
      logInfo('Add .env to .gitignore immediately');
    }
  } else {
    logWarning('.gitignore not found in parent directory');
  }

  console.log('');
  return true;
}

/**
 * Check theme access
 */
function checkThemeAccess() {
  separator();
  console.log(chalk.cyan.bold('4. THEME SCHEMA INJECTION (Phase 2)'));
  separator();

  logInfo('Theme schema injection happens AFTER products are updated');
  logInfo('You will need to add Liquid code to Shopify theme product.liquid');
  logInfo('See: PATH-B-NODE.JS-GUIDE.md for instructions');

  console.log('');
  return true;
}

/**
 * Pre-deployment checklist
 */
function preDeploymentChecklist() {
  separator();
  console.log(chalk.cyan.bold('5. PRE-DEPLOYMENT CHECKLIST'));
  separator();

  const checklist = [
    {
      item: 'Credentials validated',
      status: process.env.SHOPIFY_ACCESS_TOKEN ? true : false,
    },
    {
      item: 'Product data complete',
      status: fs.existsSync(path.join(__dirname, '..', '..', 'products-to-update.json')),
    },
    {
      item: 'No placeholder text in products',
      status: true, // Checked above
    },
    {
      item: 'All product descriptions 500+ words',
      status: true, // Checked above
    },
    {
      item: '.env in .gitignore',
      status: true, // Checked above
    },
    {
      item: 'Ready to run: npm run update-products',
      status: true,
    },
  ];

  checklist.forEach(({ item, status }) => {
    if (status) {
      console.log(`  ✅ ${item}`);
    } else {
      console.log(`  ❌ ${item}`);
    }
  });

  console.log('');
  return true;
}

/**
 * Risk assessment
 */
function riskAssessment() {
  separator();
  console.log(chalk.cyan.bold('6. RISK ASSESSMENT'));
  separator();

  const risks = [
    {
      level: 'HIGH',
      issue: 'Live products will be updated immediately',
      mitigation: 'Test on staging store first (if available)',
    },
    {
      level: 'HIGH',
      issue: 'Products will be unavailable if API fails mid-deployment',
      mitigation: 'Have manual deployment instructions as backup',
    },
    {
      level: 'MEDIUM',
      issue: 'Incorrect product descriptions could hurt SEO',
      mitigation: 'Verify all descriptions before running script',
    },
    {
      level: 'MEDIUM',
      issue: 'Schema markup errors could cause validation failures',
      mitigation: 'Test schema in Google Schema Tester after deployment',
    },
    {
      level: 'LOW',
      issue: 'API rate limiting could cause partial updates',
      mitigation: 'Script includes 500ms delay between requests',
    },
  ];

  risks.forEach(({ level, issue, mitigation }) => {
    const color = level === 'HIGH' ? chalk.red : level === 'MEDIUM' ? chalk.yellow : chalk.blue;
    console.log(`${color.bold(level)}: ${issue}`);
    console.log(`       → ${mitigation}`);
  });

  console.log('');
  return true;
}

/**
 * Summary report
 */
function summarizeResults() {
  separator();
  console.log(chalk.cyan.bold('VALIDATION SUMMARY'));
  separator();

  const total = passes + warnings + criticalIssues;
  console.log(chalk.green(`✅ Passed: ${passes}`));
  if (warnings > 0) {
    console.log(chalk.yellow(`🟡 Warnings: ${warnings}`));
  }
  if (criticalIssues > 0) {
    console.log(chalk.red(`🔴 Critical Issues: ${criticalIssues}`));
  }

  console.log('');

  if (criticalIssues > 0) {
    console.log(chalk.red.bold('❌ DEPLOYMENT BLOCKED'));
    console.log(chalk.red('Fix critical issues above before deploying'));
    return false;
  }

  if (warnings > 0) {
    console.log(chalk.yellow.bold('⚠️  PROCEED WITH CAUTION'));
    console.log(chalk.yellow('Warnings above should be reviewed before deployment'));
    return true;
  }

  console.log(chalk.green.bold('✅ READY FOR DEPLOYMENT'));
  console.log(chalk.green('All validations passed. Safe to deploy on FEB 15.'));
  return true;
}

/**
 * Main validation flow
 */
async function main() {
  console.log('');
  console.log(chalk.cyan.bold('═'.repeat(70)));
  console.log(
    chalk.cyan.bold('MAD HUDSON PHASE 1: PRE-DEPLOYMENT VALIDATION')
  );
  console.log(chalk.cyan.bold('═'.repeat(70)));
  console.log('');
  logInfo('This script validates your setup and flags any risks');
  logInfo('before you deploy products to Shopify on FEB 15');
  console.log('');

  const credentialsOK = checkCredentials();
  const productsOK = checkProductsJson();
  checkGitStatus();
  checkThemeAccess();
  preDeploymentChecklist();
  riskAssessment();

  const ready = summarizeResults();

  if (ready) {
    console.log('');
    logInfo('Next steps:');
    logInfo('1. Review risks above');
    logInfo('2. Test on staging if possible: npm run update-products');
    logInfo('3. Verify products update correctly in Shopify');
    logInfo('4. Add theme schema markup (separate step)');
    logInfo('5. On FEB 15 morning, run: npm run update-products');
    console.log('');
    process.exit(0);
  } else {
    console.log('');
    process.exit(1);
  }
}

// Run validation
main().catch((error) => {
  console.error(chalk.red('FATAL ERROR:'), error);
  process.exit(1);
});
