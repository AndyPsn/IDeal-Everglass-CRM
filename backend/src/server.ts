import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Route racine
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🚀 Everglass CRM API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      clients: '/api/clients',
      contacts: '/api/contacts',
      deals: '/api/deals',
      activities: '/api/activities'
    }
  });
});

// Route de health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Test de connexion à la base de données
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Route de test pour lister les clients
app.get('/api/clients', async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany();
    res.json({
      success: true, 
      count: clients.length,
      data: clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Route 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    availableEndpoints: [
      '/',
      '/health',
      '/api/clients'
    ]
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Everglass CRM API Server');
  console.log('='.repeat(50));
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL?.split('@')[1] || 'MySQL'}`);
  console.log('='.repeat(50));
  console.log('Available routes:');
  console.log(`  GET  /              - API info`);
  console.log(`  GET  /health        - Health check`);
  console.log(`  GET  /api/clients   - List clients`);
  console.log('='.repeat(50));
});

// Gestion propre de l'arrêt
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});