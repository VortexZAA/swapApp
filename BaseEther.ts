import * as dotenv from "dotenv";
import { callNFTContract, callTokenContract } from "./ethereumContracts";

dotenv.config();

const priceTag = process.env.PRICE_TAG || "";
const paymentToken = process.env.BASE_PAYMENT_TOKEN_CONTRACTADDRESS || "";

//Payment Token's functions

export const callMint = async (holderAddress: string, amount: number) => {
    (await callTokenContract()).contractWithSigner.mint(holderAddress, amount);
};

export const callApprove = async (amount: number) => {
    const nftContractAddress =(await callNFTContract()).nftAddress;
    (await callTokenContract()).contractWithSigner.approve(nftContractAddress, amount);
};

//Domain Nft's functinons

export const callRegister = async (domainName: string, holderAddress: string, tokenURI:string) => {
    const domain = [domainName, holderAddress, tokenURI, priceTag, paymentToken];
    (await callNFTContract()).contractWithSigner.register(domain);
};

export const callGetDomains =async (holder:string) => {
    const domains = (await callNFTContract()).contractWithSigner.getDomains(holder);    
    return domains;
}

export const callNameToDomainInfo =async (domainName:string) => {
    const domainInfo = (await callNFTContract()).contractWithSigner._nameToDomainInfo(domainName);    
    return domainInfo;
}