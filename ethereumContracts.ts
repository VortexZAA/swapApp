import { ethers } from 'ethers';
import * as dotenv from "dotenv";
dotenv.config();

declare global {
    interface Window { ethereum: any; }
}

type Chain = 'base' | 'mumbai' | 'goerli' | 'binance' | 'arbitrum';

const addresses: Record<Chain, { nft: string, token: string }> = {
    base: {
        nft: process.env.NEXT_BASE_MOSEIKI_DOMAIN_NFT_CONTRACTADDRESS as string,
        token: process.env.NEXT_BASE_PAYMENT_TOKEN_CONTRACTADDRESS as string
    },
    mumbai: {
        nft: process.env.NEXT_MUMBAI_MOSEIKI_DOMAIN_NFT_CONTRACTADDRESS as string,
        token: process.env.NEXT_MUMBAI_PAYMENT_TOKEN_CONTRACTADDRESS as string
    },
    goerli: {
        nft: process.env.NEXT_GOERLI_MOSEIKI_DOMAIN_NFT_CONTRACTADDRESS as string,
        token: process.env.NEXT_GOERLI_PAYMENT_TOKEN_CONTRACTADDRESS as string
    },
    binance: {
        nft: process.env.NEXT_BINANCE_MOSEIKI_DOMAIN_NFT_CONTRACTADDRESS as string,
        token: process.env.NEXT_BINANCE_PAYMENT_TOKEN_CONTRACTADDRESS as string
    },
    arbitrum: {
        nft: process.env.NEXT_ARBITRUM_MOSEIKI_DOMAIN_NFT_CONTRACTADDRESS as string,
        token: process.env.NEXT_ARBITRUM_PAYMENT_TOKEN_CONTRACTADDRESS as string
    }
};

const callContract = async (selectedChain: Chain, type: 'nft' | 'token') => {
    const address = addresses[selectedChain]?.[type];
    if (!address) throw new Error(`Address not found for ${selectedChain} and ${type}`);

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const abi = require(type === 'nft' ? "@abi/nftabi.json" : "@abi/abi.json");
    const contract = new ethers.Contract(address, abi, signer);
    const contractWithSigner = contract.connect(signer);

    return { contractWithSigner, address, abi };
}

export const callNFTContract = async (selectedChain: Chain) => {
    return callContract(selectedChain, 'nft');
}

export const callTokenContract = async (selectedChain: Chain) => {
    return callContract(selectedChain, 'token');
}