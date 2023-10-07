import { ConnectButton } from '@rainbow-me/rainbowkit'
import toast, { Toaster } from 'react-hot-toast'

import { useAccount } from 'wagmi'

export default function Header() {

  const { address, TokenBalance } = useAccount()
  const notifyConnectWallet = () =>
    toast.error('Connect wallet.', { duration: 2000 })

  useEffect(() => {
    setTokenBalComp(
      <>
        <TokenBalance name={'CoinA'} walletAddress={address} />
        <TokenBalance name={'CoinB'} walletAddress={address} />
        <TokenBalance name={'CoinC'} walletAddress={address} />
      </>,
    )

    if (!address) notifyConnectWallet()
  }, [address])


  return (
    <div className="fixed left-0 top-0 w-full px-8 py-4 flex items-center justify-end">{TokenBalance}
      <div className='flex'>
        <ConnectButton className='mx-8' accountStatus={'full'} />
      </div>
    </div>
  )
  
}