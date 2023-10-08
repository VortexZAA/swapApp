import * as dotenv from "dotenv";
import { callNFTContract, callTokenContract } from "./ethereumContracts";

dotenv.config();

const priceTag = process.env.PRICE_TAG || "";
const paymentToken = process.env.BASE_PAYMENT_TOKEN_CONTRACTADDRESS || "";

export const callMint = async (holderAddress: string, amount: number) => {
    (await callTokenContract()).contractWithSigner.mint(holderAddress, amount);
};

export const callRegister = async (domainName: string, holderAddress: string, tokenURI:string) => {
    const domain = [domainName, holderAddress, tokenURI, priceTag, paymentToken];
    (await callNFTContract()).contractWithSigner.register(domain);
};

