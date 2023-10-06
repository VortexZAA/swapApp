import "@/styles/globals.css";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { GrazProvider, mainnetChains, testnetChains } from "graz";
export default function App({ Component, pageProps }) {
  return (
    <GrazProvider
      grazOptions={{
        defaultChain: mainnetChains.cosmoshub,
      }}
    >
      <Component {...pageProps} />
    </GrazProvider>
  );
}
