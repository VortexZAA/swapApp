import { callNFTContract, callTokenContract } from "./ethereumContracts";
import * as dotenv from "dotenv";
dotenv.config();

const priceTag = process.env.PRICE_TAG || "";

type Chain = 'base' | 'mumbai' | 'goerli' | 'binance' | 'arbitrum';

// Payment Token's functions
export const callMint = async (selectedChain: Chain, holderAddress: string, amount: number) => {
    const { contractWithSigner } = await callTokenContract(selectedChain);
    contractWithSigner.mint(holderAddress, amount);
};

export const callApprove = async (selectedChain: Chain, amount: number) => {
    const { contractWithSigner: tokenContract} = await callTokenContract(selectedChain);
    const { contractWithSigner: nftAddress } = await callNFTContract(selectedChain);
    tokenContract.approve(nftAddress, amount);
};

export const callBalanceOf = async (selectedChain: Chain, holderAddress: string) => {
    const { contractWithSigner } = await callTokenContract(selectedChain);
    const balance = contractWithSigner.balanceOf(holderAddress);
    return balance;
};

export const callAllowance = async (selectedChain: Chain, holderAddress: string) => {
    const { contractWithSigner: tokenContract} = await callTokenContract(selectedChain);
    const { contractWithSigner: nftAddress } = await callNFTContract(selectedChain);
    const allowance = tokenContract.allowance(holderAddress, nftAddress);
    return allowance;
};

export const callTransferFrom = async (selectedChain: Chain, fromAddress: string, toAddress: string, amount: number) => {
    const { contractWithSigner } = await callTokenContract(selectedChain);
    contractWithSigner.transferFrom(fromAddress, toAddress, amount);
};  

export const callTransfer = async (selectedChain: Chain, toAddress: string, amount: number) => {
    const { contractWithSigner } = await callTokenContract(selectedChain);
    contractWithSigner.transfer(toAddress, amount);
};
export const callDecimals = async (selectedChain: Chain) => {
    const { contractWithSigner } = await callTokenContract(selectedChain);
    const decimals = contractWithSigner.decimals();
    return decimals;
};

export const callSymbol = async (selectedChain: Chain) => {
    const { contractWithSigner } = await callTokenContract(selectedChain);
    const symbol = contractWithSigner.symbol();
    return symbol;
};

export const callName = async (selectedChain: Chain) => {
    const { contractWithSigner } = await callTokenContract(selectedChain);
    const name = contractWithSigner.name();
    return name;
};

// Domain Nft's functions
export const callRegister = async (selectedChain: Chain, domainName: string, holderAddress: string, tokenURI: string) => {
    const { contractWithSigner } = await callNFTContract(selectedChain);
    const { contractWithSigner: paymentToken } = await callTokenContract(selectedChain);
    const domain = [domainName, holderAddress, tokenURI, priceTag, paymentToken];
    contractWithSigner.register(domain);
};

export const callGetDomains = async (selectedChain: Chain, holder: string) => {
    const { contractWithSigner } = await callNFTContract(selectedChain);
    const domains = contractWithSigner.getDomains(holder);
    return domains;
}

export const callNameToDomainInfo = async (selectedChain: Chain, domainName: string) => {
    const { contractWithSigner } = await callNFTContract(selectedChain);
    const domainInfo = contractWithSigner._nameToDomainInfo(domainName);
    return domainInfo;
}