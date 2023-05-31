import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, mainnet, createConfig, WagmiConfig } from "wagmi";
import { goerli, localhost } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { SwapExProvider } from "./contexts/SwapExContext.tsx";
import { SnackbarProvider } from "./contexts/SnackbarContext.tsx";
import { FaucetProvider } from "./contexts/FaucetContext.tsx";

const { chains, publicClient } = configureChains(
  [
    // mainnet,
    //, goerli,
    localhost,
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "SwapEx",
  projectId: "SWAPEX_0523",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <SnackbarProvider>
          <SwapExProvider>
            <FaucetProvider>
              <App />
            </FaucetProvider>
          </SwapExProvider>
        </SnackbarProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
