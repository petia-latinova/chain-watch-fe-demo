import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, Typography, CircularProgress, Alert, Box, Stack } from '@mui/material';
import { fetchTokenMetadata, MetadataResponse } from '../services/historyApi';
import { TOKEN_ADDRESSES, AVAILABLE_SYMBOLS } from '../constants/tokens'; 

interface TokenMetadataProps {
  symbol: string; 
}

const TokenMetadata: React.FC<TokenMetadataProps> = ({ symbol }) => {
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const contractAddress = TOKEN_ADDRESSES[symbol as keyof typeof TOKEN_ADDRESSES];

  const loadMetadata = useCallback(async () => {
    if (!contractAddress) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetchTokenMetadata(contractAddress);
      setMetadata(response);
    } catch (e: any) {
      setError(e.response?.data?.message || `Failed to fetch live metadata for ${symbol}.`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [symbol, contractAddress]);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);
  
  if (!contractAddress || !AVAILABLE_SYMBOLS.includes(symbol)) return null;

  return (
    <Card sx={{ mt: 3, mb: 4 }} elevation={4}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Token Metadata ({symbol})
        </Typography>
        
        {loading && <CircularProgress size={24} sx={{ my: 2 }} />}
        {error && <Alert severity="error">{error}</Alert>}
        
        {metadata && (
          // Use a Stack for horizontal layout, simplifying the three-column grid
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ mt: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="textSecondary">Contract Address:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {metadata.contractAddress?.slice(0, 10)}...{metadata.contractAddress?.slice(-4)}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="textSecondary">Decimals:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{metadata.tokenDecimals}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="textSecondary">Live Total Supply:</Typography>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>{metadata.totalSupply}</Typography>
              {metadata.note && <Typography variant="caption" color="warning.main">{metadata.note}</Typography>}
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenMetadata;
