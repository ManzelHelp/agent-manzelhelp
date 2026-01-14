const fs = require('fs');
const path = require('path');

const locales = ['en', 'fr', 'de', 'ar'];
const namespacesMap = {};

console.log('Analyzing translation files...\n');

locales.forEach(locale => {
  try {
    const filePath = path.join(__dirname, '..', 'messages', `${locale}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const namespaces = Object.keys(data);
    namespacesMap[locale] = namespaces;
    console.log(`${locale}.json: ${namespaces.length} namespaces`);
  } catch (e) {
    console.error(`${locale}.json: ERROR - ${e.message}`);
  }
});

// Find common namespaces
const enNamespaces = namespacesMap['en'] || [];
console.log('\n=== All namespaces in en.json ===');
enNamespaces.forEach((ns, i) => console.log(`${i + 1}. ${ns}`));

// Check consistency
console.log('\n=== Consistency check ===');
locales.forEach(locale => {
  if (locale === 'en') return;
  const localeNamespaces = namespacesMap[locale] || [];
  const missing = enNamespaces.filter(ns => !localeNamespaces.includes(ns));
  const extra = localeNamespaces.filter(ns => !enNamespaces.includes(ns));
  
  if (missing.length > 0) {
    console.log(`${locale}: Missing namespaces: ${missing.join(', ')}`);
  }
  if (extra.length > 0) {
    console.log(`${locale}: Extra namespaces: ${extra.join(', ')}`);
  }
  if (missing.length === 0 && extra.length === 0) {
    console.log(`${locale}: ✓ All namespaces match`);
  }
});

console.log(`\nTotal namespaces: ${enNamespaces.length}`);
