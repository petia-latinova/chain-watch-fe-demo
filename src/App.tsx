import { Container, Typography } from '@mui/material';
import TransactionHistory from './components/TransactionHistory';

function App() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 5 }}>
        ChainWatch: ERC20 Transaction Tracker
      </Typography>
      <TransactionHistory />
    </Container>
  );
}

export default App;
