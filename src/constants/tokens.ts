export const TOKEN_ADDRESSES = {
  'USDC': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Ethereum Sepolia USDC
  'EURC': '0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4', // Ethereum Sepolia EURC
  'CW-ERC20': '0xc2c9a6d4c2699349f69de33df8ed8a90db908944', // Ethereum Sepolia CW-ERC20:
};

export const AVAILABLE_SYMBOLS = Object.keys(TOKEN_ADDRESSES);

// Helper function to get the symbol from an address (useful for future features)
export const getSymbolFromAddress = (address: string): string | undefined => {
  const key = Object.keys(TOKEN_ADDRESSES).find(key => TOKEN_ADDRESSES[key as keyof typeof TOKEN_ADDRESSES].toLowerCase() === address.toLowerCase());
  return key;
}
