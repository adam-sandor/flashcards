import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import styled from '@emotion/styled';
import { WordCard } from './components/WordCard';
import type { SheetResponse } from './types/sheet';

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

const SetupContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin: 0.5rem 0;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #3498db;
    outline: none;
  }
`;

const Instructions = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
`;

const InstructionStep = styled.li`
  margin: 0.5rem 0;
`;

function App() {
  const [data, setData] = useState<SheetResponse['data'] | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('spreadsheetId') || '';
  });

  const initiateAuth = async () => {
    setIsAuthenticating(true);
    try {
      const response = await axios.get('http://localhost:3000/api/sheets/auth');
      window.location.href = response.data.authUrl;
    } catch (err) {
      setError('Failed to initiate authentication. Please try again.');
      setIsAuthenticating(false);
    }
  };

  const fetchRandomWord = useCallback(async () => {
    if (!spreadsheetId) {
      setError('Please enter a spreadsheet ID first');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<SheetResponse>(
        `http://localhost:3000/api/sheets/${spreadsheetId}/random`
      );
      setData(response.data.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        await initiateAuth();
      } else {
        setError('Failed to fetch random word. Please check your spreadsheet ID and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [spreadsheetId]);

  const handleSpreadsheetIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('spreadsheetId', spreadsheetId);
    fetchRandomWord();
  };

  // Check if we're returning from OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      if (spreadsheetId) {
        fetchRandomWord();
      }
    }
  }, [fetchRandomWord, spreadsheetId]);

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
        <SetupContainer>
          <form onSubmit={handleSpreadsheetIdSubmit}>
            <h2>Setup Your Spreadsheet</h2>
            <Instructions>
              <h3>How to get your Spreadsheet ID:</h3>
              <ol>
                <InstructionStep>Open your Google Spreadsheet</InstructionStep>
                <InstructionStep>Look at the URL in your browser</InstructionStep>
                <InstructionStep>The Spreadsheet ID is the long string of letters and numbers between /d/ and /edit</InstructionStep>
                <InstructionStep>Example: docs.google.com/spreadsheets/d/<strong>spreadsheet-id-here</strong>/edit</InstructionStep>
              </ol>
            </Instructions>
            <Input
              type="text"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="Paste your spreadsheet ID here"
              required
            />
            <Button type="submit">Start Using App</Button>
          </form>
        </SetupContainer>
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
        Change Spreadsheet
      </Button>
    </Container>
  );
}

export default App;
