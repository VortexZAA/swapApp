import { ethers } from 'ethers';
declare global {
    interface Window { ethereum: any; }
  }
const nftAddress = process.env.BASE_MOSEIKI_DOMAIN_NFT_CONTRACTADDRESS as string;

export const callNFTContract = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const abi = require("./nftabi.json");    
    const myNFTContract = new ethers.Contract(nftAddress, abi, signer);
    const contractWithSigner = myNFTContract.connect(signer);
    return { contractWithSigner, nftAddress, abi }
}