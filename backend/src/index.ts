import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import clientsRouter from "./routes/clients";
import invoicesRouter from "./routes/invoices";
import settingsRouter from "./routes/settings";
import pdfRouter from "./routes/pdf";
import path from 'path';
// import { authHandler } from './auth';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://*.railway.app'].filter((url): url is string => Boolean(url))
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  // Handle React Router - send all non-API requests to index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
    }
  });
}

app.use("/api/clients", clientsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/pdf", pdfRouter);
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

// Add sample data for testing
// async function addSampleData() {
//   try {
//     // Check if we already have data
//     const clientCount = await prisma.client.count();
//     if (clientCount > 0) {
//       console.log("Sample data already exists, skipping...");
//       return;
//     }
//     // Create sample clients
//     const client1 = await prisma.client.create({
//       data: {
//         name: "Empresa ABC",
//         nif: "A12345678",
//         address: "Calle Mayor 1, Madrid",
//         email: "contacto@empresaabc.com",
//         phone: "912345678"
//       }
//     });
//     const client2 = await prisma.client.create({
//       data: {
//         name: "Consultoría XYZ",
//         nif: "B87654321",
//         address: "Avenida Gran Vía 50, Barcelona",
//         email: "info@consultoriaxyz.com",
//         phone: "934567890"
//       }
//     });
//     const client3 = await prisma.client.create({
//       data: {
//         name: "Startup Innovación",
//         nif: "C11223344",
//         address: "Calle Tech 15, Valencia",
//         email: "hello@startupinnovacion.com",
//         phone: "961234567"
//       }
//     });
//     // Create sample invoices
//     await prisma.invoice.create({
//       data: {
//         number: "FAC-001",
//         date: new Date("2024-01-15"),
//         status: "PAID",
//         total: 1500.00,
//         notes: "Desarrollo de aplicación web",
//         clientId: client1.id
//       }
//     });
//     await prisma.invoice.create({
//       data: {
//         number: "FAC-002",
//         date: new Date("2024-02-20"),
//         status: "PENDING",
//         total: 2500.00,
//         notes: "Consultoría de marketing digital",
//         clientId: client2.id
//       }
//     });
//     await prisma.invoice.create({
//       data: {
//         number: "FAC-003",
//         date: new Date("2024-03-10"),
//         status: "PENDING",
//         total: 800.00,
//         notes: "Diseño de logo y branding",
//         clientId: client3.id
//       }
//     });
//     console.log("Sample data added successfully");
//   } catch (error) {
//     console.error("Error adding sample data:", error);
//   }
// }

// Start server
async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
    
    await initializeSettings();
//    await addSampleData();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

startServer();

export { prisma }; 