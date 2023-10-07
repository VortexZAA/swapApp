import React, { useEffect } from "react";
import PageButton from "./pageButton";
//import { useAccount, useConnect, useDisconnect, useActiveChain } from "graz";
import { useKeplr } from "@/services/keplr";
import { useWallet } from "@/contexts/WalletProvider";
import { getAddress } from "@/pages/swapper/main";
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
  const [accountAdress, setAccountAdress] = React.useState("");
  const toggleConnect =async () => {
    if (wallet.initialized) {
      keplr.disconnect();
    } else {
      keplr.connect();
      setAccountAdress(await getAddress())
    }
  };
  

  //console.log(accountAdress);
  
  return (
    <div className="p-2">
      {wallet.initialized ? (
        <div className="bg-white rounded-xl flex-col flex px-3 py-2">
          <PageButton name={wallet?.address} />
           {accountAdress} 
          <button className="text-red-500 hover:opacity-70 transition-colors" onClick={toggleConnect}>
            Disconnect
          </button>
        </div>
      ) : (
        <button
          className="  bg-[#6C7A3E] rounded-xl py-3 px-6 text-white"
          onClick={ toggleConnect}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default ConnectButton;
