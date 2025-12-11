import axios from 'axios';

// IMPORTANT: Ensure this environment variable is set in your .env.local file (Vite standard)
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERFACES ---

export interface HistoryFilters {
  page?: number;
  limit?: number;
  symbol?: string;
  sender?: string;
  receiver?: string;
  startTime?: string;
  endTime?: string;
}

export interface TransferEntity {
  id: number;
  contractAddress: string;
  sender: string;
  receiver: string;
  amount: string;
  symbol: string;
  timestamp: string;
  transactionHash: string;
}

export interface HistoryResponse {
  transfers: TransferEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MetadataResponse {
  contractAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  totalSupply: string;
  note?: string; 
}


// --- API FUNCTIONS ---

export const fetchTransactionHistory = async (filters: HistoryFilters): Promise<HistoryResponse> => {
  const response = await api.get('/history/transactions', { params: filters });
  return response.data;
};

export const fetchTokenMetadata = async (contractAddress: string): Promise<MetadataResponse> => {
  const response = await api.get('/history/metadata', { 
    params: { contractAddress },
  });
  return response.data;
};
