import styled from '@emotion/styled';
import type { Sheet } from '../types/sheet.js';

const ListContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SheetItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  margin: 0.5rem 0;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    transform: translateX(5px);
  }
`;

const SheetName = styled.h3`
  margin: 0;
  flex: 1;
  color: #2c3e50;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
  
  background-color: ${props => props.variant === 'secondary' ? '#6c757d' : '#3498db'};
  color: white;

  &:hover {
    background-color: ${props => props.variant === 'secondary' ? '#5a6268' : '#2980b9'};
  }
`;

interface SheetListProps {
  sheets: Sheet[];
  onSelectSheet: (sheetId: string) => void;
}

export const SheetList: React.FC<SheetListProps> = ({ sheets, onSelectSheet }) => {
  if (sheets.length === 0) {
    return (
      <ListContainer>
        <p>No spreadsheets found. Please create a Google Sheet first.</p>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <h2>Your Google Sheets</h2>
      {sheets.map(sheet => (
        <SheetItem key={sheet.id}>
          <SheetName>{sheet.name}</SheetName>
          <ButtonGroup>
            <Button
              onClick={() => onSelectSheet(sheet.id)}
            >
              Use This Sheet
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.open(sheet.webViewLink, '_blank')}
            >
              View in Google Sheets
            </Button>
          </ButtonGroup>
        </SheetItem>
      ))}
    </ListContainer>
  );
}; 