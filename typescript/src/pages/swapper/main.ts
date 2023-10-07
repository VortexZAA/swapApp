import * as dotenv from "dotenv";
import { BigNumberish, Bytes, ethers, utils } from "ethers";
import { Presets, Client } from "userop";

dotenv.config();
const signingKey = "566bc64748284e261e5ee63df8c7f71c29cff1f9244f1cd1143d985908a244a6"|| "";
const rpcUrl =  "https://api.stackup.sh/v1/node/9f6ebecfeb88c4084b37ee76dc541de352aecff3007a30cb09abf816f7762da8" || "";
const paymasterUrl = process.env.PAYMASTER_URL || "https://api.stackup.sh/v1/paymaster/9f6ebecfeb88c4084b37ee76dc541de352aecff3007a30cb09abf816f7762da8";
const uniswapUniversalRouter = process.env.UNISWAP_UNIVERSAL_ROUTER || "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD";

export async function execute(value: string, commands: string, inputs: Bytes[], deadline: string): Promise<any[]> {
    const UNISWAP_ABI = require("./uniabi.json");
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const uniRouter = new ethers.Contract(uniswapUniversalRouter, UNISWAP_ABI, provider);

    const _execute = {
        to: uniswapUniversalRouter,
        value: ethers.utils.parseUnits(value, "ether"),
        data: uniRouter.interface.encodeFunctionData("execute(bytes,bytes[],uint256)", [commands, inputs, deadline]),
    };
    return [_execute];
}


export async function swap() {
    // create a userOp builder
    const signer:any = new ethers.Wallet(signingKey);
    const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(paymasterUrl, {
        type: "payg",
    });
    const builder = await Presets.Builder.Kernel.init(signer, rpcUrl, { paymasterMiddleware: paymasterMiddleware });
    const address = builder.getSender();
    //console.log("Account address: " + address);

    //create the calls
    const value = "0.1";  
    const commands = "0x0b08";
    const deadline = "1716654725";
    const inputs = [
        "0x0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000016345785d8a0000",
        "0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000136c4a73a0725d7400000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d60000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984"
    ];
    const inputsAsBytes = inputs.map(input => ethers.utils.arrayify(input));

    const calls = await execute(value, commands, inputsAsBytes, deadline);
    builder.executeBatch(calls);
    console.log(builder.getOp())

    //Send the userOperation
    const client = await Client.init(rpcUrl);
    const res = await client.sendUserOperation(builder, {
        onBuild: (op) => console.log("Signed UserOperation: ", op),
    });
    console.log("UserOpHash: " + res.userOpHash);
    const ev = await res.wait();
    console.log("Transaction Hash: " + ev?.transactionHash ?? null);
}

export default swap

// const dotenv = require("dotenv");
// const ethers = require("ethers");
// const { Presets, Client } = require("userop");

// dotenv.config();
// const signingKey = process.env.SIGNING_KEY || "";
// const rpcUrl = process.env.RPC_URL || "";
// const paymasterUrl = process.env.PAYMASTER_URL || "";
// const uniswapUniversalRouter = process.env.UNISWAP_UNIVERSAL_ROUTER || "";

// async function execute(value, commands, inputs, deadline) {
//     const UNISWAP_ABI = require("./uniabi.json");
//     const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
//     const uniRouter = new ethers.Contract(uniswapUniversalRouter, UNISWAP_ABI, provider);

//     const _execute = {
//         to: uniswapUniversalRouter,
//         value: ethers.utils.parseUnits(value, "ether"),
//         data: uniRouter.interface.encodeFunctionData("execute(bytes,bytes[],uint256)", [commands, inputs, deadline]),
//     };
//     return [_execute];
// }

// async function main() {
//     // create a userOp builder
//     const signer = new ethers.Wallet(signingKey);
//     const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(paymasterUrl, {
//         type: "payg",
//     });
//     const builder = await Presets.Builder.Kernel.init(signer, rpcUrl, { paymasterMiddleware: paymasterMiddleware });
//     const address = builder.getSender();
//     console.log("Account address: " + address);

//     //create the calls
//     const value = "0.1";  
//     const commands = "0x0b08";
//     const deadline = "1716654725";
//     const inputs = [
//         "0x0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000016345785d8a0000",
//         "0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000136c4a73a0725d7400000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d60000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984"
//     ];
//     const inputsAsBytes = inputs.map(input => ethers.utils.arrayify(input));

//     const calls = await execute(value, commands, inputsAsBytes, deadline);
//     builder.executeBatch(calls);
//     console.log(builder.getOp())

//     //Send the userOperation
//     const client = await Client.init(rpcUrl);
//     const res = await client.sendUserOperation(builder, {
//         onBuild: (op) => console.log("Signed UserOperation: ", op),
//     });
//     console.log("UserOpHash: " + res.userOpHash);
//     const ev = await res.wait();
//     console.log("Transaction Hash: " + (ev ? ev.transactionHash : null));
// }

// module.exports = main;

