import React from 'react'
import PageButton from '@/components/pageButton'

const ConnectButton = props => {
  const { isConnected, signerAddress, getSigner, provider } = props
  const displayAddress = `${signerAddress?.substring(0, 10)}...`

  return (
    <div className='p-2'>
      {isConnected() ? (
        <div className="buttonContainer px-3 py-2">
          <PageButton name={displayAddress} />
        </div>
      ) : (
        <button
          className="  bg-[#6C7A3E] rounded-xl py-3 px-6 text-white"
          onClick={() => getSigner(provider)}
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}

export default ConnectButton