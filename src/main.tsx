// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App.tsx';
// import './index.css';

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// );

// src/main.tsx

// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { WagmiProvider } from 'wagmi';
import { config } from './wagmi.config.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import { PrivyProvider } from '@privy-io/react-auth';
import { sepolia } from 'wagmi/chains';

const queryClient = new QueryClient();
const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;

if (!privyAppId) {
  throw new Error("VITE_PRIVY_APP_ID is not set in .env.local!");
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrivyProvider 
      appId={privyAppId} 
      config={{
        defaultChain: sepolia,
        supportedChains: [sepolia],
        loginMethods: ['email', 'google', 'twitter'], 
        appearance: {
          theme: 'light',
          accentColor: '#6767ff', 
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets', 
          },
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  </React.StrictMode>,
);
