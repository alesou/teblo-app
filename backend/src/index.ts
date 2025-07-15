import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import clientsRouter from "./routes/clients";
import invoicesRouter from "./routes/invoices";
import settingsRouter from "./routes/settings";
import migrationRouter from "./routes/migration";

import path from 'path';

const app = express();
const prisma = new PrismaClient();
const PORT = parseInt(process.env.PORT || '3001', 10);

// CORS configuration for separate services
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://www.teblo.app',
        'https://www.teblo.app',
        'https://teblo-frontend-production.up.railway.app',
        'https://*.railway.app',
        'https://*.up.railway.app'
      ]
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Teblo API is running!', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.use("/api/clients", clientsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/migration", migrationRouter);

// app.use('/api/auth', authHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize default settings
async function initializeSettings() {
  try {
    const existingSettings = await prisma.settings.findFirst();
    if (!existingSettings) {
      await prisma.settings.create({
        data: {
          companyName: "Mi Empresa",
          companyNif: "B12345678",
          companyAddress: "Calle Principal 123, Madrid",
          logoUrl: "",
          invoicePrefix: "FAC",
          nextNumber: 1
        }
      });
      console.log("Default settings created");
    }
  } catch (error) {
    console.error("Error creating default settings:", error);
  }
}



// Start server
async function startServer() {
  try {
    console.log("Starting server...");
    console.log("Environment:", process.env.NODE_ENV || 'development');
    console.log("Database URL exists:", !!process.env.DATABASE_URL);
    console.log("Database URL preview:", process.env.DATABASE_URL?.substring(0, 20) + "...");
    console.log("Port:", PORT);
    
    console.log("Attempting database connection...");
    
    // Add timeout to database connection
    const connectPromise = prisma.$connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout after 30 seconds')), 30000);
    });
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.log("Database connected successfully");
    
    await initializeSettings();
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Server is ready to accept connections`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        prisma.$disconnect();
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error("Error starting server:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));
    process.exit(1);
  }
}

startServer();

export { prisma }; 