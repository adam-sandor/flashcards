import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import styled from '@emotion/styled';
import { WordCard } from './components/WordCard';
import { SheetList } from './components/SheetList';
import type { SheetResponse, Sheet } from './types/sheet';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2.5rem;
`;

const Button = styled.button`
  display: block;
  margin: 2rem auto;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  text-align: center;
  padding: 1rem;
  margin: 1rem auto;
  max-width: 600px;
  background: #fdf0f0;
  border-radius: 8px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #2c3e50;
  font-size: 1.2rem;
`;

function App() {
  const [data, setData] = useState<SheetResponse['data'] | undefined>();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('spreadsheetId') || '';
  });

  const initiateAuth = async () => {
    setIsAuthenticating(true);
    try {
      const response = await axios.get('/api/sheets/auth');
      window.location.href = response.data.authUrl;
    } catch (err) {
      setError('Failed to initiate authentication. Please try again.');
      setIsAuthenticating(false);
    }
  };

  const fetchSheets = async () => {
    try {
      const response = await axios.get('/api/sheets/list');
      setSheets(response.data.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const errorCode = err.response?.data?.code;
        
        if (status === 401 || errorCode === 401) {
          await initiateAuth();
          return;
        }
        
        setError(err.response?.data?.message || 'Failed to fetch sheets list. Please try again.');
      } else {
        setError('Failed to fetch sheets list. Please try again.');
      }
    }
  };

  const fetchRandomWord = useCallback(async () => {
    if (!spreadsheetId) {
      setError('Please select a spreadsheet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<SheetResponse>(
        `/api/sheets/${spreadsheetId}/random`
      );
      setData(response.data.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const errorCode = err.response?.data?.code;
        
        if (status === 401 || errorCode === 401) {
          await initiateAuth();
          return;
        }
        
        setError(err.response?.data?.message || 'Failed to fetch random word. Please try again.');
      } else {
        setError('Failed to fetch random word. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [spreadsheetId]);

  const handleSelectSheet = (sheetId: string) => {
    setSpreadsheetId(sheetId);
    localStorage.setItem('spreadsheetId', sheetId);
    fetchRandomWord();
  };

  // Check URL parameters and handle authentication
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    
    if (error === 'auth_failed') {
      setError('Authentication failed. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (code) {
      // Remove the code from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Fetch sheets list after successful authentication
      fetchSheets();
    } else {
      // Initial load - try to fetch sheets, which will redirect to auth if needed
      fetchSheets();
    }
  }, []); // Only run on mount

  if (isAuthenticating) {
    return (
      <Container>
        <Title>Random Word Generator</Title>
        <LoadingMessage>Redirecting to Google authentication...</LoadingMessage>
      </Container>
    );
  }

  if (!spreadsheetId) {
    return (
      <Container>
        <Title>Random Word Generator</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <SheetList sheets={sheets} onSelectSheet={handleSelectSheet} />
      </Container>
    );
  }

  return (
    <Container>
      <Title>Random Word Generator</Title>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <WordCard
        data={data}
        isLoading={isLoading}
        onClick={fetchRandomWord}
      />
      <Button
        onClick={fetchRandomWord}
        disabled={isLoading}
      >
        Get Another Word
      </Button>
      <Button
        onClick={() => {
          localStorage.removeItem('spreadsheetId');
          setSpreadsheetId('');
          setData(undefined);
        }}
        style={{ background: '#e74c3c' }}
      >
        Change Sheet
      </Button>
    </Container>
  );
}

export default App;
