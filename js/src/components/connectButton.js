import React from 'react'
import PageButton from '../components/pageButton'
import { useAccount, useConnect, useDisconnect, useActiveChain } from "graz";

const ConnectButton = props => {
  const { isConnected, data: account } = useAccount();
  const activeChain = useActiveChain();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const { isConnected:connectMetamask, signerAddress, getSigner, provider } = props
  const displayAddress = `${signerAddress?.substring(0, 10)}...`
  console.log(account);
  return (
    <div className='p-2'>
      {isConnected ? (
        <div className="buttonContainer px-3 py-2">
          <PageButton name={account?.bech32Address.toString() || ''} />
        </div>
      ) : (
        <button
          className="  bg-[#6C7A3E] rounded-xl py-3 px-6 text-white"
          onClick={() => connect() /* getSigner(provider) */}
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}

export default ConnectButton