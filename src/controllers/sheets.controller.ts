import { Request, Response } from 'express';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class SheetsController {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  public getAuthUrl = (_req: Request, res: Response) => {
    const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
    
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.json({ authUrl: url });
  };

  public handleCallback = async (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        throw new AppError(400, 'Authorization code is required');
      }

      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // In a real application, you should store these tokens securely
      // and associate them with the user's session
      res.json({ 
        message: 'Successfully authenticated',
        // Only send non-sensitive parts of tokens
        expiryDate: tokens.expiry_date
      });
    } catch (error) {
      logger.error('OAuth callback error:', error);
      throw new AppError(500, 'Failed to complete authentication');
    }
  };

  public getSheetData = async (req: Request, res: Response) => {
    try {
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
      logger.error('Error fetching sheet data:', error);
      throw new AppError(500, 'Failed to fetch sheet data');
    }
  };

  public getRandomRow = async (req: Request, res: Response) => {
    try {
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
      logger.error('Error fetching random row:', error);
      throw new AppError(500, 'Failed to fetch random row');
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