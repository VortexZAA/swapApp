import * as dotenv from "dotenv";
import { callNFTContract } from "./ethereumContracts";

dotenv.config();

const priceTag = process.env.PRICE_TAG || "";
const paymentToken = process.env.BASE_PAYMENT_TOKEN_CONTRACTADDRESS || "";

export const callRegister = async (domainName: string, holderAddress: string, tokenURI:string) => {
    const domain = [domainName, holderAddress, tokenURI, priceTag, paymentToken];
    (await callNFTContract()).contractWithSigner.register(domain);
};