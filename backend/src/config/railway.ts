// Railway deployment configuration
export const railwayConfig = {
  // Puppeteer configuration for Railway
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=VizDisplayCompositor',
      '--disable-features=TranslateUI',
      '--disable-features=BlinkGenPropertyTrees',
      '--disable-ipc-flooding-protection',
      '--disable-web-security',
      '--disable-features=site-per-process',
      '--single-process'
    ]
  },
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db'
  },
  
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL, 'https://*.railway.app'].filter(Boolean)
        : ['http://localhost:3000'],
      credentials: true
    }
  }
};

export default railwayConfig; 