import { Express } from 'express';
import { sheetsRouter } from './sheets.routes';

export const setupRoutes = (app: Express) => {
  app.use('/api/sheets', sheetsRouter);
}; 