import styled from '@emotion/styled';
import { SheetResponse } from '../types/sheet';

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 2rem auto;
  transition: transform 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Word = styled.h2`
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 2rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
`;

const Definition = styled.p`
  color: #34495e;
  font-size: 1.2rem;
  margin: 1rem 0;
  line-height: 1.6;
`;

const Example = styled.p`
  color: #7f8c8d;
  font-style: italic;
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-left: 4px solid #3498db;
  border-radius: 4px;
`;

const LoadingCard = styled(Card)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #7f8c8d;
`;

interface WordCardProps {
  data?: SheetResponse['data'];
  isLoading: boolean;
  onClick: () => void;
}

export const WordCard: React.FC<WordCardProps> = ({ data, isLoading, onClick }) => {
  if (isLoading) {
    return <LoadingCard>Loading...</LoadingCard>;
  }

  if (!data) {
    return <LoadingCard>No data available</LoadingCard>;
  }

  // Get the keys from the data object (assuming they're consistent with your sheet)
  const [wordKey, definitionKey, exampleKey] = Object.keys(data);

  return (
    <Card onClick={onClick}>
      <Word>{data[wordKey]}</Word>
      <Definition>{data[definitionKey]}</Definition>
      <Example>{data[exampleKey]}</Example>
    </Card>
  );
}; 