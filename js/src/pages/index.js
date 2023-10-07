import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { GearFill } from 'react-bootstrap-icons';

import ConnectButton from '../components/connectButton';
import ConfigModal from '../components/configModal';
import CurrencyField from '../components/currencyField';

import BeatLoader from "react-spinners/BeatLoader";
import { getWethContract, getUniContract, getPrice, runSwap } from './AlphaRouterService'
import swap from './swapper/main';

export default function App() {
  const [provider, setProvider] = useState(undefined)
  const [signer, setSigner] = useState(undefined)
  const [signerAddress, setSignerAddress] = useState(undefined)

  const [slippageAmount, setSlippageAmount] = useState(2)
  const [deadlineMinutes, setDeadlineMinutes] = useState(10)
  const [showModal, setShowModal] = useState(undefined)

  const [inputAmount, setInputAmount] = useState(undefined)
  const [outputAmount, setOutputAmount] = useState(undefined)
  const [transaction, setTransaction] = useState(undefined)
  const [loading, setLoading] = useState(undefined)
  const [ratio, setRatio] = useState(undefined)
  const [wethContract, setWethContract] = useState(undefined)
  const [uniContract, setUniContract] = useState(undefined)
  const [wethAmount, setWethAmount] = useState(undefined)
  const [uniAmount, setUniAmount] = useState(undefined)


  useEffect(() => {

    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)

      const wethContract = getWethContract()
      setWethContract(wethContract)

      const uniContract = getUniContract()
      setUniContract(uniContract)
    }
    onLoad()
  }, [])

  const getSigner = async provider => {
    provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    setSigner(signer)
  }
  const isConnected = () => signer !== undefined
  const getWalletAddress = () => {
    signer.getAddress()
      .then(async (address) => {
        setSignerAddress(address)
        const provider = await new ethers.providers.Web3Provider(window.ethereum)

        let balance = await provider.getBalance(address);
        console.log(ethers.utils.formatEther(balance));
        //setWethAmount(ethers.utils.formatEther(balance))
        // todo: connect weth and uni contracts
        wethContract.balanceOf(address)
          .then(res => {
            setWethAmount(Number(ethers?.utils?.formatEther(res) || 0))
          })
        uniContract.balanceOf(address)
          .then(res => {
            setUniAmount(Number(ethers.utils.formatEther(res)))
          })

      })
  }

  if (signer !== undefined) {
    getWalletAddress()
  }

  const getSwapPrice = (inputAmount) => {
    setLoading(true)
    setInputAmount(inputAmount)

    const swap = getPrice(
      inputAmount,
      slippageAmount,
      Math.floor(Date.now() / 1000 + (deadlineMinutes * 60)),
      signerAddress
    )
  }


  return (
    <div className=" w-full h-screen flex flex-col bg-gradient-to-r from-[#868C31] via-green-50 to-[#BBCF9A]">
      <div className="appNav">
        {/*  <div className="my-2 hidden buttonContainer buttonContainerTop">
          <PageButton name={"Swap"} isBold={true} />
          <PageButton name={"Pool"} />
          <PageButton name={"Vote"} />
          <PageButton name={"Charts"} />
        </div> */}

        <div className="rightNav">
          <div className="connectButtonContainer">
            <ConnectButton
              provider={provider}
              isConnected={isConnected}
              signerAddress={signerAddress}
              getSigner={getSigner}
            />
          </div>
         {/*  <div className="my-2 buttonContainer">
            <PageButton name={"..."} isBold={true} />
          </div> */}
        </div>
      </div>

      <div className="w-full h-full flex justify-center items-center ">
        <div className="swapContainer" style={{
          borderRadius: '16px',
          background: 'rgba(254, 253, 249, 0.24)',
          backdropFilter: 'blur(36px)'
        }}>
          <div className="swapHeader">
            <span className="swapText" >Swap</span>
            <span className="gearContainer" onClick={() => setShowModal(true)}>
              <GearFill />
            </span>
            {showModal && (
              <ConfigModal
                onClose={() => setShowModal(false)}
                setDeadlineMinutes={setDeadlineMinutes}
                deadlineMinutes={deadlineMinutes}
                setSlippageAmount={setSlippageAmount}
                slippageAmount={slippageAmount} />
            )}
          </div>

          <div className="swapBody relative justify-center items-center flex flex-col"> 
           <button className='bg-[url(/arrow.svg)] z-50 object-fill w-12 h-12 bg-no-repeat absolute '>
            
           </button>
            <CurrencyField
              field="input"
              tokenName="WETH"
              getSwapPrice={getSwapPrice}
              signer={signer}
              balance={wethAmount} />
            <CurrencyField
              field="output"
              tokenName="UNI"
              value={outputAmount}
              signer={signer}
              balance={uniAmount}
              spinner={BeatLoader}
              loading={loading} />
          </div>

          <div className="ratioContainer">
            {ratio && (
              <>
                {`1 UNI = ${ratio} WETH`}
              </>
            )}
          </div>

          <div className=" flex justify-center -mt-5">
            {isConnected() ? (
              <button
                onClick={() => swap}
                className="rounded-lg bg-[#6C7A3E] text-white p-3 flex w-2/3 justify-center"
              >
                Swap
              </button>
            ) : (
              <button
                onClick={() => getSigner(provider)}
                className=" rounded-lg bg-[#6C7A3E] text-white p-3 flex w-2/3 justify-center"
              >
                Connect Wallet
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}