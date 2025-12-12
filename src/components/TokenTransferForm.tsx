import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, Stack, Alert, CircularProgress, Box } from '@mui/material';
import { usePrivy, useWallets, ConnectedWallet } from '@privy-io/react-auth';
import { useConnection, useWriteContract, useWaitForTransactionReceipt, useSimulateContract } from 'wagmi'; 
import { parseUnits, isAddress, encodeFunctionData } from 'viem';
import { ERC20_TRANSFER_ABI } from '../abi/erc20-transfer-abi';
import { TOKEN_ADDRESSES } from '../constants/tokens'; 
import { sepolia } from 'wagmi/chains';

const TARGET_TOKEN_SYMBOL = 'CW-ERC20';
const TARGET_TOKEN_ADDRESS = TOKEN_ADDRESSES[TARGET_TOKEN_SYMBOL] as `0x${string}`;
const TARGET_TOKEN_DECIMALS = 18; 
const SEPOLIA_CHAIN_ID = sepolia.id;

type PrivyViemClient = ConnectedWallet & { 
    client: { 
        sendTransaction: (args: any) => Promise<`0x${string}`>;
        chain: any;
    };
    chain: any;
};

const TokenTransferForm: React.FC = () => {
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [txnStatus, setTxnStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [txnError, setTxnError] = useState<string | null>(null);
  const { authenticated: isPrivyConnected } = usePrivy(); 
  const { wallets } = useWallets(); 
  const { status: wagmiStatus } = useConnection();
  const isWagmiConnected = wagmiStatus === 'connected';
  const privyEmbeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy') as PrivyViemClient | undefined;
  const valueToSend = amount ? parseUnits(amount as `${number}`, TARGET_TOKEN_DECIMALS) : 0n;
  const { data: simulationData } = useSimulateContract({
    abi: ERC20_TRANSFER_ABI,
    address: TARGET_TOKEN_ADDRESS,
    functionName: 'transfer',
    args: [isAddress(recipient) ? (recipient as `0x${string}`) : '0x0000000000000000000000000000000000000000', valueToSend],
    query: {
        enabled: isWagmiConnected && isAddress(recipient) && valueToSend > 0n,
    },
  });
  const { data: wagmiHash, writeContract } = useWriteContract(); 
  const { isLoading: isWaitingForReceipt, isSuccess: isTxnConfirmed } = 
    useWaitForTransactionReceipt({ hash: wagmiHash });
  const isConnected = isWagmiConnected || isPrivyConnected;
  const isTxnPending = txnStatus === 'pending' || isWaitingForReceipt;
  const validateForm = () => {
    if (!isAddress(recipient)) return 'Invalid recipient address.';
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return 'Invalid amount.';
    return null;
  };
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxnStatus('idle');
    setTxnError(null);

    const validationError = validateForm();
    if (validationError) {
      setTxnError(validationError);
      return;
    }
    if (!isConnected) {
        setTxnError("Please connect a wallet to proceed.");
        return;
    }
    try {
      setTxnStatus('pending');

      if (isWagmiConnected) {
        if (!simulationData?.request) {
            throw new Error("Transaction simulation failed. Check token balance and network.");
        }
        writeContract(simulationData.request);
      
      } else if (isPrivyConnected && privyEmbeddedWallet) {
        const data = encodeFunctionData({
            abi: ERC20_TRANSFER_ABI,
            functionName: 'transfer',
            args: [recipient as `0x${string}`, valueToSend],
        });
        if (!privyEmbeddedWallet.client) {
             throw new Error("Embedded wallet client not available.");
        }
        const chainId = privyEmbeddedWallet.chain?.id || SEPOLIA_CHAIN_ID;
        
        const txHash = await privyEmbeddedWallet.client.sendTransaction({
            to: TARGET_TOKEN_ADDRESS,
            data: data,
            chain: { id: chainId },
        });
        console.log('Privy Transaction Hash:', txHash);
        setTxnStatus('success');

      } else {
        setTxnError("No active wallet found for transaction signing.");
        setTxnStatus('error');
      }

    } catch (e: any) {
      console.error("Transfer error:", e);
      const errMsg = e.shortMessage || e.message || "Transaction failed due to an unexpected error.";
      setTxnError(errMsg);
      setTxnStatus('error');
    }
  };
  useEffect(() => {
    if (isTxnConfirmed) {
        setTxnStatus('success');
        setTxnError(null);
    } 
  }, [isTxnConfirmed]); 
  return (
    <Card sx={{ mt: 4, mb: 4 }} elevation={4}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Transfer {TARGET_TOKEN_SYMBOL} Tokens
        </Typography>
        
        {!isConnected && (
            <Alert severity="warning">Connect your wallet to enable transfers.</Alert>
        )}
        <Box component="form" onSubmit={handleTransfer} sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              fullWidth
              disabled={isTxnPending || !isConnected}
              placeholder="0x..."
            />
            <TextField
              label={`Amount of ${TARGET_TOKEN_SYMBOL}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              type="number"
              inputProps={{ step: "any" }}
              disabled={isTxnPending || !isConnected}
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!isConnected || isTxnPending || !validateForm() || (isWagmiConnected && !simulationData)}
              sx={{ height: '56px' }}
            >
              {isTxnPending ? <CircularProgress size={24} color="inherit" /> : `Transfer ${TARGET_TOKEN_SYMBOL}`}
            </Button>
          </Stack>
        </Box>

        {txnStatus === 'error' && <Alert severity="error" sx={{ mt: 2 }}>Transfer Failed: {txnError}</Alert>}
        {txnStatus === 'success' && <Alert severity="success" sx={{ mt: 2 }}>Transfer Confirmed! Hash: {wagmiHash || 'Check console'}</Alert>}
        {txnStatus === 'pending' && <Alert severity="info" sx={{ mt: 2 }}>Transaction Pending...</Alert>}

      </CardContent>
    </Card>
  );
};

export default TokenTransferForm;
