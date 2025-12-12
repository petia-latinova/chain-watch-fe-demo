import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Typography, Box, TablePagination, CircularProgress, 
  TextField, MenuItem, Select, InputLabel, FormControl, Button, 
  useTheme, Alert, Stack, Divider, Switch, FormControlLabel // Keep new imports for wallet features
} from '@mui/material';
import { 
  fetchTransactionHistory, HistoryFilters, HistoryResponse, TransferEntity 
} from '../services/historyApi';
import { AVAILABLE_SYMBOLS } from '../constants/tokens';
import TokenMetadata from './TokenMetadata'; 

const DEFAULT_LIMIT = 10;

interface TransactionHistoryProps {
    connectedAddress: string | null;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ connectedAddress }) => {
  const theme = useTheme();
  const DEFAULT_SYMBOL = AVAILABLE_SYMBOLS[0] || 'USDC'; 
  const [filterByWallet, setFilterByWallet] = useState(false);
  
  const [appliedFilters, setAppliedFilters] = useState<HistoryFilters>({ 
    page: 1, 
    limit: DEFAULT_LIMIT, 
    symbol: DEFAULT_SYMBOL 
  });
  
  const [inputFilters, setInputFilters] = useState({
    symbol: appliedFilters.symbol,
    sender: '',
    receiver: '',
    startTime: '',
    endTime: '',
  });

  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadHistory = useCallback(async () => {
    setData(null); 
    setLoading(true);
    setError(null);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(appliedFilters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      const response = await fetchTransactionHistory(cleanFilters);
      setData(response);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to fetch transaction history. Check API URL.');
      console.error(e);
      setData(null); 
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  const handleApplyFilters = () => {
    const senderFilter = filterByWallet ? connectedAddress || undefined : inputFilters.sender.trim() || undefined;
    const receiverFilter = filterByWallet ? connectedAddress || undefined : inputFilters.receiver.trim() || undefined;
    
    setAppliedFilters({ 
      page: 1,
      limit: DEFAULT_LIMIT,
      symbol: inputFilters.symbol,
      sender: senderFilter,
      receiver: receiverFilter,
      startTime: inputFilters.startTime ? new Date(inputFilters.startTime).toISOString() : undefined,
      endTime: inputFilters.endTime ? new Date(inputFilters.endTime).toISOString() : undefined,
    });
  };

  useEffect(() => {
    handleApplyFilters();
  }, [filterByWallet, connectedAddress]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);


  const handleChangePage = (event: unknown, newPage: number) => {
    setAppliedFilters(prev => ({ ...prev, page: newPage + 1 })); 
  };
  
  const headers = ['TX Hash', 'Symbol', 'Amount', 'Sender', 'Receiver', 'Timestamp'];

  return (
    <Box sx={{ mt: 4 }}>
      <TokenMetadata symbol={inputFilters.symbol || DEFAULT_SYMBOL} />
      <Divider sx={{ my: 3 }} />
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom color="textSecondary" sx={{ mb: 2 }}>
            Filter and Token Configuration
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="symbol-select-label">Symbol</InputLabel>
            <Select
              labelId="symbol-select-label"
              value={inputFilters.symbol} 
              label="Symbol"
              onChange={(e) => {
                setInputFilters(prev => ({ ...prev, symbol: e.target.value }));
              }}
            >
              {AVAILABLE_SYMBOLS.map(symbol => (
                <MenuItem key={symbol} value={symbol}>{symbol}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            sx={{ flex: 1 }}
            size="small"
            label="Sender Address"
            value={inputFilters.sender}
            disabled={filterByWallet} 
            onChange={(e) => setInputFilters(prev => ({ ...prev, sender: e.target.value }))}
          />
          <TextField
            sx={{ flex: 1 }}
            size="small"
            label="Receiver Address"
            value={inputFilters.receiver}
            disabled={filterByWallet} 
            onChange={(e) => setInputFilters(prev => ({ ...prev, receiver: e.target.value }))}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}> 
          {connectedAddress && (
              <FormControlLabel
                control={
                  <Switch
                    checked={filterByWallet}
                    onChange={(e) => setFilterByWallet(e.target.checked)}
                    name="filterByWallet"
                    color="primary"
                    disabled={!connectedAddress}
                  />
                }
                label="My Transactions Only"
                sx={{ mr: 2 }} 
              />
          )}
          <TextField
            sx={{ minWidth: 200 }}
            size="small"
            label="Start Date/Time"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={inputFilters.startTime}
            onChange={(e) => setInputFilters(prev => ({ ...prev, startTime: e.target.value }))}
          />
          <TextField
            sx={{ minWidth: 200 }}
            size="small"
            label="End Date/Time"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={inputFilters.endTime}
            onChange={(e) => setInputFilters(prev => ({ ...prev, endTime: e.target.value }))}
          />
          <Button 
            variant="contained" 
            onClick={handleApplyFilters}
            disabled={loading}
            sx={{ height: '40px' }} 
          >
            Search
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}> 
        Transaction History ({appliedFilters.symbol})
      </Typography>  
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}   
      {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}  
      {!loading && data && (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  {headers.map(header => (
                    <TableCell key={header}><b>{header}</b></TableCell> 
                  ))}
                </TableRow>
              </TableHead>
              
              <TableBody>
                {data.transfers?.length > 0 ? (
                  data.transfers.map((tx: TransferEntity) => (
                    <TableRow key={tx.transactionHash} hover>
                      <TableCell>{tx.transactionHash.slice(0, 8)}...{tx.transactionHash.slice(-6)}</TableCell>
                      <TableCell>{tx.symbol}</TableCell>
                      <TableCell>{tx.amount}</TableCell>
                      <TableCell>{tx.sender.slice(0, 8)}...</TableCell>
                      <TableCell>{tx.receiver.slice(0, 8)}...</TableCell>
                      <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                      <TableCell colSpan={headers.length}>
                          <Typography sx={{ mt: 3, p: 1, textAlign: 'center' }}>
                              No transfers found matching current filters. Try changing your search parameters.
                          </Typography>
                      </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={data.total || 0} // Safely access count
            page={appliedFilters.page ? appliedFilters.page - 1 : 0} 
            onPageChange={handleChangePage}
            rowsPerPage={DEFAULT_LIMIT}
            rowsPerPageOptions={[DEFAULT_LIMIT]}
            labelDisplayedRows={({ from, to, count }) => {
              if (count === 0) {
                return '0–0 of 0';
              }
              return `${from}–${to} of ${count}`;
            }}
          />
        </>
      )}   
    </Box>
  );
};

export default TransactionHistory;
