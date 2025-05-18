import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for development
}));
app.use(express.json());

// API routes
setupRoutes(app);

// Serve static files from the React app
const clientPath = path.resolve(__dirname, '..', 'client', 'dist');
logger.info(`Serving static files from: ${clientPath}`);
app.use(express.static(clientPath));

// Handle React routing, return all requests to React app
app.get('*', (_req, res) => {
  const indexPath = path.join(clientPath, 'index.html');
  logger.info(`Serving index.html from: ${indexPath}`);
  res.sendFile(indexPath);
});

// Error handling
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    await createConnection({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: ['src/entities/**/*.ts'],
      synchronize: process.env.NODE_ENV === 'development', // Don't use in production
    });

    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer(); 