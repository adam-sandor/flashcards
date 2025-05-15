import { Router } from 'express';
import { SheetsController } from '../controllers/sheets.controller';

const router = Router();
const sheetsController = new SheetsController();

// OAuth2 routes
router.get('/auth', sheetsController.getAuthUrl);
router.get('/auth/callback', sheetsController.handleCallback);

// Sheet operations
router.get('/:spreadsheetId', sheetsController.getSheetData);
router.get('/:spreadsheetId/random', sheetsController.getRandomRow);
router.post('/:spreadsheetId/sync', sheetsController.syncSheetData);

export const sheetsRouter = router; 