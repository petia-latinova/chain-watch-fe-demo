import { Container, Typography, Box } from '@mui/material';
import TransactionHistory from './components/TransactionHistory';
import WalletConnectButton from './components/WalletConnectButton'; 
import { useConnection, useConnections } from 'wagmi';
import { usePrivy, useWallets } from '@privy-io/react-auth';

function App() {
  const wagmiCurrentConnection = useConnection();
  const connections = useConnections();
  const { wallets } = useWallets();
  const { authenticated: isPrivyAuthenticated } = usePrivy();

  const wagmiActiveConnectionData = wagmiCurrentConnection?.connector
    ? connections.find(c => c.connector.id === wagmiCurrentConnection.connector?.id)
    : undefined;

  const isWagmiConnected = wagmiCurrentConnection?.status === 'connected';
  const wagmiAddress = wagmiActiveConnectionData?.accounts?.[0];

  const currentAddress = isWagmiConnected
    ? wagmiAddress
    : isPrivyAuthenticated && wallets.length > 0
      ? wallets[0].address
      : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          ChainWatch: ERC20 Transaction Tracker
        </Typography>
        <WalletConnectButton />
      </Box>
      <TransactionHistory connectedAddress={currentAddress ?? null} />
    </Container>
  );
}

export default App;
