import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { SwapExProvider } from "./contexts/SwapExContext.tsx";
import { SnackbarProvider } from "./contexts/SnackbarContext.tsx";
import { FaucetProvider } from "./contexts/FaucetContext.tsx";
import { StakerProvider } from "./contexts/StakerContext.tsx";

const { chains, publicClient } = configureChains([goerli], [publicProvider()]);

const { connectors } = getDefaultWallets({
  appName: "SwapEx",
  projectId: "1a157ddc02ca122e1fbf6b52f456f122",
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
              <StakerProvider>
                <App />
              </StakerProvider>
            </FaucetProvider>
          </SwapExProvider>
        </SnackbarProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
