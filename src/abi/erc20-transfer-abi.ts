// Minimal ABI for the ERC20 transfer function
import { parseAbi } from 'viem';

export const ERC20_TRANSFER_ABI = parseAbi([
  'function transfer(address to, uint256 value) returns (bool)',
]);
