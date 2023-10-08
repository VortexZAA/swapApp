import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { Presets, Client } from "userop";

dotenv.config();

const signingKey = process.env.SIGNING_KEY || "";
const rpcUrl = process.env.MATIC_RPC_URL || "";
const paymasterUrl = process.env.MATIC_PAYMASTER_URL || "";
const paymentToken = process.env.MATIC_PAYMENT_TOKEN_CONTRACTADDRESS || "";
const domainNFT = process.env.MATIC_MOSEIKI_DOMAIN_NFT_CONTRACTADDRESS || "";
const priceTag = process.env.PRICE_TAG || "";

async function approveAndRegister(address: string, value: string, domain: string[]): Promise<any[]> {
    const ERC20_ABI = require("./abi.json");
    const REGISTER_ABI = require("./nftabi.json");
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const erc20 = new ethers.Contract(paymentToken, ERC20_ABI, provider);
    const domainNFTContract = new ethers.Contract(domainNFT, REGISTER_ABI, provider);

    if (value == "100") {
        const decimals = await Promise.all([erc20.decimals()]);
        const amount = ethers.utils.parseUnits(value, decimals);

        const mint ={
            to: paymentToken,
            value: ethers.constants.Zero,
            data: erc20.interface.encodeFunctionData("mint", [address, amount]),
        };

        const approve = {
            to: paymentToken,
            value: ethers.constants.Zero,
            data: erc20.interface.encodeFunctionData("approve", [domainNFT, amount]),
        };       

        const register = {
            to: domainNFT,
            value: ethers.constants.Zero,
            data: domainNFTContract.interface.encodeFunctionData("register", [domain]),
        };

        return [mint,approve , register];
    } else {

        const register = {
            to: domainNFT,
            value: ethers.utils.parseEther(value),
            data: domainNFTContract.interface.encodeFunctionData("register", [domain]),
        };

        return [register];
    }
}

async function register(domainName: string, tokenURI: string, choice: number, salt: number) {
    const signer = new ethers.Wallet(signingKey);
    const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(paymasterUrl, {
        type: "payg",
    });
    const builder = await Presets.Builder.Kernel.init(signer, rpcUrl, { paymasterMiddleware: paymasterMiddleware , salt : salt});
    const address = builder.getSender();
    console.log("Account address: " + address);
    const domain = [domainName, address, tokenURI, priceTag, paymentToken];
    const simpleAccount = address;
    if (choice == 0) {
        const value = "100";
        const calls = await approveAndRegister(simpleAccount, value, domain);
        builder.executeBatch(calls);
    } else {
        const value = "0.01";
        const calls = await approveAndRegister(simpleAccount, value, domain);
        builder.executeBatch(calls);
    }

    //Send the userOperation
    const client = await Client.init(rpcUrl);
    const res = await client.sendUserOperation(builder, {
        onBuild: (op) => console.log("Signed UserOperation: ", op),
    });
    
    console.log("UserOpHash: " + res.userOpHash);
    const ev = await res.wait();
    console.log("Transaction Hash: " + ev?.transactionHash ?? null);
}

let name = "test1";
let uri = "testURI/1.json"
let chc = 0;
let salt = 0x7;
export default register(name, uri, chc, salt)
