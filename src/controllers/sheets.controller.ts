import { Request, Response, NextFunction } from 'express';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class SheetsController {
  private oauth2Client: OAuth2Client;
  private static tokens: any = null;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials if they exist
    if (SheetsController.tokens) {
      this.oauth2Client.setCredentials(SheetsController.tokens);
    }
  }

  private checkAuth = () => {
    logger.info('Checking auth status:', { 
      hasTokens: !!SheetsController.tokens,
      tokenDetails: SheetsController.tokens ? {
        hasAccessToken: !!SheetsController.tokens.access_token,
        hasRefreshToken: !!SheetsController.tokens.refresh_token,
        expiryDate: SheetsController.tokens.expiry_date
      } : null
    });
    
    if (!SheetsController.tokens) {
      throw new AppError(401, 'Not authenticated');
    }
  };

  public getAuthUrl = (_req: Request, res: Response, next: NextFunction) => {
    try {
      const scopes = [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly'
      ];
      
      const url = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
      });

      res.json({ authUrl: url });
    } catch (error) {
      next(error);
    }
  };

  public handleCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        throw new AppError(400, 'Authorization code is required');
      }

      logger.info('Getting tokens from auth code');
      const { tokens } = await this.oauth2Client.getToken(code);
      
      logger.info('Received tokens:', { 
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: tokens.expiry_date
      });
      
      // Store tokens in memory (in a real app, you'd store these in a database)
      SheetsController.tokens = tokens;
      
      // Set the credentials
      this.oauth2Client.setCredentials(tokens);

      // Redirect back to the frontend
      res.redirect('/');
    } catch (error) {
      logger.error('OAuth callback error:', {
        error: error,
        stack: error instanceof Error ? error.stack : undefined,
        message: error instanceof Error ? error.message : String(error)
      });
      res.redirect('/?error=auth_failed');
    }
  };

  public listSheets = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      this.checkAuth();
      logger.info('Starting listSheets operation');

      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
      
      logger.info('Making Drive API request');
      const response = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        fields: 'files(id, name, webViewLink)',
        orderBy: 'modifiedTime desc'
      });
      logger.info('Drive API request successful', { fileCount: response.data.files?.length });

      res.json({
        status: 'success',
        data: response.data.files
      });
    } catch (error) {
      logger.error('Error in listSheets:', {
        error: error,
        stack: error instanceof Error ? error.stack : undefined,
        message: error instanceof Error ? error.message : String(error)
      });
      next(error);
    }
  };

  public getSheetData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.checkAuth();

      const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
      const spreadsheetId = req.params.spreadsheetId;

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1', // You might want to make this configurable
      });

      res.json({
        status: 'success',
        data: response.data.values
      });
    } catch (error) {
      next(error);
    }
  };

  public getRandomRow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.checkAuth();

      const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
      const spreadsheetId = req.params.spreadsheetId;

      // Get all values from the sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1',
      });

      const rows = response.data.values;
      if (!rows || rows.length <= 1) { // Assuming first row is headers
        throw new AppError(404, 'No data found in sheet');
      }

      // Skip header row (index 0) when selecting random row
      const randomIndex = Math.floor(Math.random() * (rows.length - 1)) + 1;
      const selectedRow = rows[randomIndex];

      // Take only first 3 columns
      const firstThreeColumns = selectedRow.slice(0, 3);

      // Get header names from first row
      const headers = rows[0].slice(0, 3);

      // Create an object with header names as keys
      const formattedResponse = headers.reduce((obj: Record<string, string>, header: string, index: number) => {
        obj[header] = firstThreeColumns[index] || '';
        return obj;
      }, {});

      res.json({
        status: 'success',
        data: formattedResponse
      });
    } catch (error) {
      next(error);
    }
  };

  public syncSheetData = async (req: Request, res: Response) => {
    try {
      const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
      const spreadsheetId = req.params.spreadsheetId;
      
      // Add your sync logic here
      // This is where you would implement the logic to sync between
      // Google Sheets and your PostgreSQL database
      
      res.json({
        status: 'success',
        message: 'Data synced successfully',
      });
    } catch (error) {
      logger.error('Error syncing sheet data:', error);
      throw new AppError(500, 'Failed to sync sheet data');
    }
  };
} 