const fs = require('fs');
const path = require('path');

const locales = ['en', 'fr', 'de', 'ar'];
const namespaces = [
  'Metadata', 'common', 'Header', 'homepage', 'dashboard', 'profile', 'Footer',
  'taskerProfile', 'auth', 'search', 'serviceCard', 'notifications', 'postJob',
  'applications', 'myJobs', 'postService', 'taskerOffer', 'customerBookings',
  'bookingDetails', 'finance', 'chat', 'jobApplications', 'taskerBookings',
  'taskerBookingTabs', 'jobOffer', 'contact', 'admin', 'errors', 'toasts',
  'bookings', 'messages', 'reviews', 'jobDetails', 'services', 'settings',
  'findAHelper', 'becomeAHelper', 'help', 'privacyPolicy', 'termsOfService'
];

console.log('Testing message loading (simulating request.ts)...\n');

locales.forEach(locale => {
  console.log(`Loading messages for ${locale}...`);
  const messages = {};
  const messagesDir = path.join(__dirname, '..', 'messages', locale);
  
  let loaded = 0;
  let failed = 0;
  
  for (const namespace of namespaces) {
    try {
      const filePath = path.join(messagesDir, `${namespace}.json`);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const namespaceData = JSON.parse(fileContent);
      Object.assign(messages, namespaceData);
      loaded++;
    } catch (error) {
      console.error(`  ❌ Failed to load ${namespace}: ${error.message}`);
      failed++;
    }
  }
  
  const totalKeys = Object.keys(messages).length;
  const expectedNamespaces = namespaces.length;
  
  console.log(`  ✓ Loaded ${loaded}/${expectedNamespaces} namespaces`);
  console.log(`  ✓ Total top-level keys: ${totalKeys}`);
  
  if (totalKeys === expectedNamespaces && failed === 0) {
    console.log(`  ✅ ${locale}: SUCCESS\n`);
  } else {
    console.log(`  ❌ ${locale}: FAILED (expected ${expectedNamespaces} namespaces, got ${totalKeys})\n`);
  }
});

console.log('✅ Message loading test complete!');
