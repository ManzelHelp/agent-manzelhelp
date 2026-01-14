const fs = require('fs');
const path = require('path');

// Read all translation files to get existing keys
const locales = ['en', 'fr', 'de', 'ar'];
const existingKeys = {};

locales.forEach(locale => {
  existingKeys[locale] = new Set();
  const localeDir = path.join(__dirname, '..', 'messages', locale);
  
  if (fs.existsSync(localeDir)) {
    const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));
    
    files.forEach(file => {
      try {
        const filePath = path.join(localeDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const namespace = Object.keys(data)[0];
        const keys = extractKeys(data[namespace], namespace);
        keys.forEach(key => existingKeys[locale].add(key));
      } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
      }
    });
  }
});

function extractKeys(obj, prefix = '') {
  const keys = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...extractKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

// Scan source files for translation usage
const srcDir = path.join(__dirname, '..', 'src');
const usedKeys = new Set();

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find useTranslations("namespace")
    const useTranslationsRegex = /useTranslations\(["']([^"']+)["']\)/g;
    let match;
    while ((match = useTranslationsRegex.exec(content)) !== null) {
      const namespace = match[1];
      usedKeys.add(`namespace:${namespace}`);
    }
    
    // Find t("key") or t('key')
    const tRegex = /t\(["']([^"']+)["']\)/g;
    while ((match = tRegex.exec(content)) !== null) {
      const key = match[1];
      // Skip if it's a variable or template literal
      if (!key.includes('${') && !key.includes('`')) {
        usedKeys.add(key);
      }
    }
  } catch (e) {
    // Skip files that can't be read
  }
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip node_modules and other ignored directories
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') {
      continue;
    }
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      scanFile(fullPath);
    }
  }
}

console.log('Scanning source files for translation usage...\n');
scanDirectory(srcDir);

console.log(`Found ${usedKeys.size} unique translation keys/namespaces used in code\n`);

// Check which keys are missing
const missingKeys = {};
locales.forEach(locale => {
  missingKeys[locale] = [];
  
  usedKeys.forEach(usedKey => {
    if (!existingKeys[locale].has(usedKey)) {
      missingKeys[locale].push(usedKey);
    }
  });
  
  if (missingKeys[locale].length > 0) {
    console.log(`\n=== Missing keys in ${locale} ===`);
    missingKeys[locale].slice(0, 50).forEach(key => console.log(`  - ${key}`));
    if (missingKeys[locale].length > 50) {
      console.log(`  ... and ${missingKeys[locale].length - 50} more`);
    }
  } else {
    console.log(`\n✓ ${locale}: All used keys found`);
  }
});

// Summary
const totalMissing = Object.values(missingKeys).reduce((sum, arr) => sum + arr.length, 0);
console.log(`\n=== Summary ===`);
console.log(`Total missing keys across all locales: ${totalMissing}`);
