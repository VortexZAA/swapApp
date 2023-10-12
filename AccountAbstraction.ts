import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { Presets, Client } from "userop";

const ERC20_ABI = require("@abi/abi.json");
const REGISTER_ABI = require("@abi/nftabi.json");

dotenv.config();

const priceTag = process.env.NEXT_PRICE_TAG || "";
const signingKey = process.env.NEXT_SIGNING_KEY || "";

type ChainConfig = {
    rpcUrl: string;
    paymasterUrl: string;
    paymentToken: string;
    domainNFT: string;
};

const chainConfigs: Record<string, ChainConfig> = {
    mumbai: {
        rpcUrl: process.env.MATIC_RPC_URL || "",
        paymasterUrl: process.env.MATIC_PAYMASTER_URL || "",
        paymentToken: process.env.MATIC_PAYMENT_TOKEN_CONTRACTADDRESS || "",
        domainNFT: process.env.MATIC_MOSEIKI_DOMAIN_NFT_CONTRACTADDRESS || ""
    },
    goerli: {
        rpcUrl: process.env.NEXT_GOERLI_RPC_URL || "",
        paymasterUrl: process.env.NEXT_GOERLI_PAYMASTER_URL || "",
        paymentToken: process.env.NEXT_GOERLI_PAYMENT_TOKEN_CONTRACTADDRESS || "",
        domainNFT: process.env.NEXT_GOERLI_MOSEIKI_DOMAIN_NFT_CONTRACTADDRESS || ""
    },
    binance: {
        rpcUrl: process.env.NEXT_BINANCE_RPC_URL || "",
        paymasterUrl: process.env.NEXT_BINANCE_PAYMASTER_URL || "",
        paymentToken: process.env.NEXT_BINANCE_PAYMENT_TOKEN_CONTRACTADDRESS || "",
        domainNFT: process.env.NEXT_BINANCE_MOSEIKI_DOMAIN_NFT_CONTRACTADDRESS || ""
    },
    arbitrum: {
        rpcUrl: process.env.NEXT_ARBITRUM_RPC_URL || "",
        paymasterUrl: process.env.NEXT_ARBITRUM_PAYMASTER_URL || "",
        paymentToken: process.env.NEXT_ARBITRUM_PAYMENT_TOKEN_CONTRACTADDRESS || "",
        domainNFT: process.env.NEXT_ARBITRUM_MOSEIKI_DOMAIN_NFT_CONTRACTADDRESS || ""
    }
};

function getChainConfig(selectedChain: string): ChainConfig {
    return chainConfigs[selectedChain] || {};
}

async function approveAndRegister(address: string, value: string, domain: string[], rpcUrl: string, paymentToken: string, domainNFT: string): Promise<any[]> {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const erc20 = new ethers.Contract(paymentToken, ERC20_ABI, provider);
    const domainNFTContract = new ethers.Contract(domainNFT, REGISTER_ABI, provider);

    if (value === "100") {
        const decimals = await erc20.decimals();
        const amount = ethers.utils.parseUnits(value, decimals);

        const mint = {
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

        return [mint, approve, register];
    } else {
        const register = {
            to: domainNFT,
            value: ethers.utils.parseEther(value),
            data: domainNFTContract.interface.encodeFunctionData("register", [domain]),
        };

        return [register];
    }
}

async function register(domainName: string, tokenURI: string, isPaymentToken: boolean, salt: number, selectedChain: string) {
    const { rpcUrl, paymasterUrl, paymentToken, domainNFT } = getChainConfig(selectedChain);

    const signer = new ethers.Wallet(signingKey);
    const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(paymasterUrl, {
        type: "payg",
    });
    const builder = await Presets.Builder.Kernel.init(signer, rpcUrl, { paymasterMiddleware: paymasterMiddleware, salt: salt });
    const address = builder.getSender();
    console.log("Account address: " + address);
    const domain = [domainName, address, tokenURI, priceTag, paymentToken];
    const simpleAccount = address;
    if (isPaymentToken) {
        const value = "100";
        const calls = await approveAndRegister(simpleAccount, value, domain, rpcUrl, paymentToken, domainNFT);
        builder.executeBatch(calls);
    } else {
        const value = "0.01";
        const calls = await approveAndRegister(simpleAccount, value, domain, rpcUrl, paymentToken, domainNFT);
        builder.executeBatch(calls);
    }
    const client = await Client.init(rpcUrl);
    const res = await client.sendUserOperation(builder, {
        onBuild: (op) => console.log("Signed UserOperation: ", op),
    });

    console.log("UserOpHash: " + res.userOpHash);
    const ev = await res.wait();
    console.log("Transaction Hash: " + ev?.transactionHash ?? null);
}

export async function getSimpleAccount(selectedChain: string, salt: number) {
    const { rpcUrl, paymasterUrl } = getChainConfig(selectedChain);

    const signer = new ethers.Wallet(signingKey);
    const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(paymasterUrl, {
        type: "payg",
    });
    const builder = await Presets.Builder.Kernel.init(signer, rpcUrl, { paymasterMiddleware: paymasterMiddleware, salt: salt });
    const simpleAccount = builder.getSender();
    return simpleAccount;
}

let name = "test1";
let uri = "testURI/1.json";
let chc = true;
let salt = 0x25;
export default register(name, uri, chc, salt, "mumbai");