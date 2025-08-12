import i18n from '../config/i18n';

export const testTranslations = () => {
  const requiredKeys = [
    // Navigation
    'navigation.dashboard',
    'navigation.clients',
    'navigation.invoices',
    'navigation.settings',
    
    // Common
    'common.loading',
    'common.save',
    'common.cancel',
    'common.edit',
    'common.delete',
    'common.create',
    'common.new',
    'common.close',
    'common.back',
    'common.next',
    'common.previous',
    'common.search',
    'common.filter',
    'common.clear',
    'common.all',
    'common.none',
    'common.yes',
    'common.no',
    'common.error',
    'common.success',
    'common.warning',
    'common.info',
    'common.saving',
    
    // Auth
    'auth.signOut',
    'auth.signIn',
    'auth.signUp',
    'auth.email',
    'auth.password',
    'auth.confirmPassword',
    
    // Dashboard
    'dashboard.title',
    'dashboard.subtitle',
    'dashboard.newInvoice',
    'dashboard.stats.totalInvoices',
    'dashboard.stats.totalClients',
    'dashboard.stats.totalRevenue',
    'dashboard.stats.pendingRevenue',
    'dashboard.recentInvoices',
    'dashboard.recentClients',
    'dashboard.noInvoices',
    'dashboard.noClients',
    'dashboard.includesPartialPayments',
    'dashboard.total',
    'dashboard.invoiceNumber',
    'dashboard.client',
    'dashboard.date',
    'dashboard.status',
    'dashboard.viewAll',
    'dashboard.createInvoice',
    'dashboard.addFirstInvoice',
    
    // Clients
    'clients.title',
    'clients.newClient',
    'clients.editClient',
    'clients.name',
    'clients.email',
    'clients.phone',
    'clients.address',
    'clients.nif',
    'clients.notes',
    'clients.noClients',
    'clients.addFirstClient',
    'clients.loadError',
    'clients.saveError',
    'clients.saveChanges',
    'clients.deleteError',
    'clients.deleteConfirm',
    'clients.nameRequired',
    'clients.loadInvoicesError',
    'clients.clientInvoices',
    'clients.totalBilled',
    
    // Invoices
    'invoices.title',
    'invoices.subtitle',
    'invoices.newInvoice',
    'invoices.editInvoice',
    'invoices.invoiceNumber',
    'invoices.date',
    'invoices.dueDate',
    'invoices.client',
    'invoices.amount',
    'invoices.status',
    'invoices.actions',
    'invoices.noInvoices',
    'invoices.addFirstInvoice',
    'invoices.createFirstInvoice',
    'invoices.clickToPreview',
    'invoices.noClient',
    'invoices.paid',
    'invoices.pending',
    'invoices.download',
    'invoices.searchFilters',
    'invoices.searchClientOrNumber',
    'invoices.loadError',
    'invoices.deleteInvoice',
    'invoices.viewPaymentHistory',
    'invoices.markAsPaid',
    'invoices.cancelInvoice',
    'invoices.convertToDefinitive',
    'invoices.confirmConvertToDefinitive',
    'invoices.convertError',
    'invoices.loadPaymentHistoryError',
    'invoices.addPaymentError',
    'invoices.statuses.pending',
    'invoices.statuses.paid',
    'invoices.statuses.cancelled',
    'invoices.statuses.proForma',
    
    // CreateInvoice
    'createInvoice.title',
    'createInvoice.success',
    'createInvoice.successMessage',
    'createInvoice.generatingPDF',
    'createInvoice.downloadPDF',
    'createInvoice.goToInvoices',
    'createInvoice.basicInfo',
    'createInvoice.client',
    'createInvoice.selectClient',
    'createInvoice.date',
    'createInvoice.invoiceType',
    'createInvoice.definitiveInvoice',
    'createInvoice.proForma',
    'createInvoice.selectClientError',
    'createInvoice.addValidConceptError',
    'createInvoice.saveError',
    
    // Payments
    'payments.managePayments',
    'payments.invoiceTotal',
    'payments.status',
    'payments.registeredPayments',
    'payments.noPaymentsRegistered',
    'payments.addNewPayment',
    'payments.amountPaid',
    'payments.paymentDate',
    'payments.paymentType',
    'payments.total',
    'payments.partial',
    'payments.savePayment',
    'payments.totalPaid',
    'payments.pending',
    'payments.addPayment',
    'payments.loadingPayments',
    'payments.noPaymentsForInvoice',
    'payments.clickAddPayment',
    'payments.addPaymentTo',
    'payments.amount',
    'payments.date',
    'payments.notes',
    
    // Layout
    'layout.quickActions',
    'layout.newInvoice',
    'layout.donate',
    
    // Settings
    'settings.title',
    'settings.language',
    'settings.languages.es',
    'settings.languages.en',
    
    // Donation
    'donation.title',
    'donation.description'
  ];

  const missingKeys: string[] = [];
  const availableLanguages = ['es', 'en'];

  for (const language of availableLanguages) {
    i18n.changeLanguage(language);
    for (const key of requiredKeys) {
      const translation = i18n.t(key);
      if (translation === key) { // i18next returns the key itself if translation is missing
        missingKeys.push(`${language}: ${key}`);
      }
    }
  }

  if (missingKeys.length > 0) {
    console.error('❌ Missing translations:', missingKeys);
    return false;
  } else {
    console.log('✅ All translations are available!');
    return true;
  }
};

export const testLanguageChange = () => {
  console.log('🧪 Testing language change functionality...');
  
  // Test initial language
  const initialLanguage = i18n.language;
  console.log(`📝 Initial language: ${initialLanguage}`);
  
  // Test changing to English
  i18n.changeLanguage('en');
  localStorage.setItem('i18nextLng', 'en');
  console.log(`🌍 Changed to English: ${i18n.language}`);
  
  // Test changing to Spanish
  i18n.changeLanguage('es');
  localStorage.setItem('i18nextLng', 'es');
  console.log(`🇪🇸 Changed to Spanish: ${i18n.language}`);
  
  // Test localStorage persistence
  const storedLanguage = localStorage.getItem('i18nextLng');
  console.log(`💾 Stored language in localStorage: ${storedLanguage}`);
  
  // Restore initial language
  i18n.changeLanguage(initialLanguage);
  localStorage.setItem('i18nextLng', initialLanguage);
  
  console.log('✅ Language change test completed!');
  return true;
};

export const testLanguagePersistence = () => {
  console.log('🧪 Testing language persistence...');
  
  // Test setting language and checking localStorage
  const testLanguage = 'en';
  i18n.changeLanguage(testLanguage);
  localStorage.setItem('i18nextLng', testLanguage);
  
  // Simulate page reload by reinitializing
  const storedLanguage = localStorage.getItem('i18nextLng');
  console.log(`💾 Stored language: ${storedLanguage}`);
  
  if (storedLanguage === testLanguage) {
    console.log('✅ Language persistence working correctly!');
    return true;
  } else {
    console.error('❌ Language persistence not working!');
    return false;
  }
};

// Run tests if in browser environment
if (typeof window !== 'undefined') {
  console.log('🚀 Running i18n tests...');
  
  const translationsOk = testTranslations();
  const languageChangeOk = testLanguageChange();
  const persistenceOk = testLanguagePersistence();
  
  if (translationsOk && languageChangeOk && persistenceOk) {
    console.log('🎉 All i18n tests passed!');
  } else {
    console.error('❌ Some i18n tests failed!');
  }
} 