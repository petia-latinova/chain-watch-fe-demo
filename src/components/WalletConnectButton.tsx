import React, { useState } from 'react';
import { Button, Menu, MenuItem, Typography, Box, Divider } from '@mui/material';
import { usePrivy, useWallets } from '@privy-io/react-auth';

import { 
  useConnection, 
  useConnections, 
  useConnect, 
  useDisconnect, 
  useConnectors 
} from 'wagmi';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import MetamaskIcon from '@mui/icons-material/AccountBalance'; 
import PeopleIcon from '@mui/icons-material/People'; 

const WalletConnectButton: React.FC = () => {
  const wagmiCurrentConnection = useConnection();
  const connections = useConnections();
  const connectors = useConnectors();
  
  // Find the injected/Metamask connector instance
  const injectedConnector = connectors.find(c => c.id.includes('injected') || c.name.toLowerCase().includes('metamask'));

  const wagmiActiveConnectionData = wagmiCurrentConnection?.connector
    ? connections.find(c => c.connector.id === wagmiCurrentConnection.connector?.id)
    : undefined;

  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const isWagmiConnected = wagmiCurrentConnection?.status === 'connected';
  const wagmiAddress = wagmiActiveConnectionData?.accounts?.[0];

  const { 
    ready: isPrivyReady,
    authenticated: isPrivyAuthenticated,
    login,
    logout: privyLogout,
    user
  } = usePrivy();

  const { wallets } = useWallets();

  const isConnected = isWagmiConnected || isPrivyAuthenticated;

  const currentAddress = isWagmiConnected
    ? wagmiAddress
    : isPrivyAuthenticated && wallets.length > 0
      ? wallets[0].address
      : null;

  const shortAddress = currentAddress
    ? `${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}`
    : 'Connect Wallet';

  const connectionType = isWagmiConnected
    ? 'MetaMask'
    : isPrivyAuthenticated
      ? (user?.email ? 'Privy (Email)' : 'Privy (Social)')
      : '';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleWagmiConnect = () => {
    if (!injectedConnector) return; 
    connect({ connector: injectedConnector });
    handleClose();
  };

  const handleDisconnect = () => {
    if (isWagmiConnected) disconnect();
    if (isPrivyAuthenticated) privyLogout();
    handleClose();
  };

  if (!isPrivyReady) {
    return <Button variant="contained" disabled>Loading...</Button>;
  }

  if (!isConnected) {
    return (
      <>
        <Button 
          variant="contained"
          onClick={handleMenuClick}
          startIcon={<AccountBalanceWalletIcon />}
        >
          Connect Wallet
        </Button>

        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={() => { handleClose(); login(); }}>
            <PeopleIcon sx={{ mr: 1 }} />
            Login with Email/Social (Privy)
          </MenuItem>
          <MenuItem 
            onClick={handleWagmiConnect}
            disabled={!injectedConnector} 
          >
            <MetamaskIcon sx={{ mr: 1 }} />
            Connect with MetaMask
            {!injectedConnector && " (Not Detected)"} 
          </MenuItem>
        </Menu>
      </>
    );
  }
  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleMenuClick}
        startIcon={<AccountBalanceWalletIcon />}
      >
        {shortAddress}
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <Box sx={{ p: 1 }}>
          <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
            Connected via: {connectionType}
          </Typography>

          <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold', wordBreak: 'break-all' }}>
            {currentAddress}
          </Typography>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={handleDisconnect}>
          <LogoutIcon sx={{ mr: 1 }} /> Disconnect
        </MenuItem>
      </Menu>
    </>
  );
};

export default WalletConnectButton;
