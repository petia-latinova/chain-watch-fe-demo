import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

const sepoliaRpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_REACT_APP_ALCHEMY_API_KEY}`;

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
  ],
  transports: {
    [sepolia.id]: http(sepoliaRpcUrl),
  },
});
