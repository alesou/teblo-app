// Railway deployment configuration
export const railwayConfig = {
  // Puppeteer configuration for Railway
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-features=site-per-process',
      '--disable-software-rasterizer'
    ]
    // Let puppeteer find Chrome automatically
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