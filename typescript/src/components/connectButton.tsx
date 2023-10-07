import React from "react";
import PageButton from "./pageButton";
//import { useAccount, useConnect, useDisconnect, useActiveChain } from "graz";
import { useKeplr } from "@/services/keplr";
import { useWallet } from "@/contexts/WalletProvider";
const ConnectButton = (props: any) => {
  /* const { isConnected, data: account } = useAccount();
  const activeChain = useActiveChain();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect(); */

  const {
    isConnected: connectMetamask,
    signerAddress,
    getSigner,
    provider,
  } = props;
  const displayAddress = `${signerAddress?.substring(0, 10)}...`;
  //console.log(account);
  const wallet = useWallet();
  const keplr = useKeplr();
  const toggleConnect = () => {
    if (wallet.initialized) {
      keplr.disconnect();
    } else {
      keplr.connect();
    }
  };
  return (
    <div className="p-2">
      { wallet.initialized? (
        <div className="buttonContainer px-3 py-2">
          <PageButton name={wallet?.address} />
        </div>
      ) : (
        <button
          className="  bg-[#6C7A3E] rounded-xl py-3 px-6 text-white"
          onClick={() => keplr.connect() /* getSigner(provider) */}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default ConnectButton;
