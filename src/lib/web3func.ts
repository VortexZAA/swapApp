import { ethers } from "ethers";
//@ts-ignore
import { getAccountNonce } from "permissionless";
//@ts-ignore
import {
  UserOperation,
  bundlerActions,
  getSenderAddress,
  getUserOperationHash,
  waitForUserOperationReceipt,
  GetUserOperationReceiptReturnType,
  signUserOperationHashWithECDSA,
} from "permissionless";
//@ts-ignore
import {
  pimlicoBundlerActions,
  pimlicoPaymasterActions,
} from "permissionless/actions/pimlico";
import {
  Address,
  Hash,
  concat,
  createClient,
  createPublicClient,
  encodeFunctionData,
  http,
  Hex,
} from "viem";
import {
  generatePrivateKey,
  privateKeyToAccount,
  signMessage,
} from "viem/accounts";
import { lineaTestnet, scrollSepolia } from "viem/chains";
// DEFINE THE CONSTANTS
const privateKey =
  "0x45ddf996bd2801e91cce585c73240aadc5b18acd4b19dff5810f591c802e426c"; // replace this with a private key you generate!
const apiKey = "93e51e8c-29ab-476d-8195-2dc2adb88979"; // replace with your Pimlico API key

const ENTRY_POINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const SIMPLE_ACCOUNT_FACTORY_ADDRESS =
  "0x9406Cc6185a346906296840746125a0E44976454";
const chain = "scroll-sepolia-testnet";

if (apiKey === undefined) {
  throw new Error(
    "Please replace the `apiKey` env variable with your Pimlico API key"
  );
}

if (privateKey.match(/GENERATED_PRIVATE_KEY/)) {
  throw new Error(
    "Please replace the `privateKey` variable with a newly generated private key. You can use `generatePrivateKey()` for this"
  );
}
const publicClient = createPublicClient({
  transport: http("https://sepolia-rpc.scroll.io/"),
  chain: scrollSepolia,
});

const signer = privateKeyToAccount(privateKey as Hash);
// CALCULATE THE DETERMINISTIC SENDER ADDRESS

export async function getInitCode({ userNumber }: { userNumber: number }) {
  let initCode = concat([
    SIMPLE_ACCOUNT_FACTORY_ADDRESS,
    encodeFunctionData({
      abi: [
        {
          inputs: [
            { name: "owner", type: "address" },
            { name: "salt", type: "uint256" },
          ],
          name: "createAccount",
          outputs: [{ name: "ret", type: "address" }],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      args: [signer.address, BigInt(userNumber)],
    }),
  ]);

  const senderAddress = await getSenderAddress(publicClient, {
    initCode,
    entryPoint: ENTRY_POINT_ADDRESS,
  });
  return senderAddress;
}
// CALCULATE THE DETERMINISTIC SENDER ADDRESS
let initCode = concat([
  SIMPLE_ACCOUNT_FACTORY_ADDRESS,
  encodeFunctionData({
    abi: [
      {
        inputs: [
          { name: "owner", type: "address" },
          { name: "salt", type: "uint256" },
        ],
        name: "createAccount",
        outputs: [{ name: "ret", type: "address" }],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    args: [signer.address, BigInt(0)],
  }),
]);
//contracts
const erc20PaymasterAddress = "0x65B8C906cf61eB52E12B0c68AE0f7D46E3386903";
const usdcTokenAddress = "0x690000EF01deCE82d837B5fAa2719AE47b156697"; // USDC on Polygon Mumbai
const uniswapRouter = "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD";
const scrollToken = "0x00A5Aa31fe45ef1627222b9eFEf7A05f841dC1E3";
const mock = "0x2FF7940952C5F08288ace086D8dC3bdBE6F1BCCA";

const bundlerClient: any = createClient({
  transport: http(`https://api.pimlico.io/v2/${chain}/rpc?apikey=${apiKey}`),
  chain: scrollSepolia,
}).extend(pimlicoBundlerActions);
console.log("bundlerClient", bundlerClient);

const paymasterClient = createClient({
  // ⚠️ using v2 of the API ⚠️
  transport: http(`https://api.pimlico.io/v2/${chain}/rpc?apikey=${apiKey}`),
  chain: scrollSepolia,
}).extend(pimlicoPaymasterActions);

// DEPLOY THE SIMPLE WALLET
const genereteApproveCallData = (
  erc20TokenAddress: Address,
  paymasterAddress: Address
) => {
  const approveData = encodeFunctionData({
    abi: [
      {
        inputs: [
          { name: "_to", type: "address" },
          { name: "_amount", type: "uint256" },
        ],
        name: "mint",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    args: [erc20TokenAddress, BigInt(32000000)],
  });

  // GENERATE THE CALLDATA TO APPROVE THE USDC
  const to = scrollToken;
  const value = BigInt(0);
  const data = approveData;

  const callData = encodeFunctionData({
    abi: [
      {
        inputs: [
          { name: "dest", type: "address" },
          { name: "value", type: "uint256" },
          { name: "func", type: "bytes" },
        ],
        name: "execute",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    args: [to, value, data],
  });

  return callData;
};

type HexString = `0x${string}`;

/* const genereteSwapData = (
  erc20TokenAddress: Address,
  paymasterAddress: Address
) => {
  const commands = "0x0b00";
  const deadline = BigInt(1716654725);
  const inputs: HexString[] = [
    "0x0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000009184e72a000",
    "0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000009184e72a00000000000000000000000000000000000000000000000000000006de8846537e400000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bb4fbf271143f4fbf7b91a5ded31805e42b2208d60001f41f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000",
  ];
  //const inputsAsBytes = inputs.map((input) => ethers.utils.arrayify(input));
  const approveData = encodeFunctionData({
    abi: [
      {
        inputs: [
          { name: "commands", type: "bytes" },
          { name: "inputs", type: "bytes[]" },
          { name: "deadline", type: "uint256" },
        ],
        name: "execute",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    args: [commands, inputs, deadline],
  });

  // GENERATE THE CALLDATA TO APPROVE THE USDC
  const to = erc20TokenAddress;
  const value = BigInt(0);
  const data = approveData;

  const callData = encodeFunctionData({
    abi: [
      {
        inputs: [
          { name: "dest", type: "address" },
          { name: "value", type: "uint256" },
          { name: "func", type: "bytes" },
        ],
        name: "execute",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    args: [to, value, data],
  });

  return callData;
}; */
export async function mint({ senderAddress }: { senderAddress: Address }) {
  try {
    console.log("Counterfactual sender address:", senderAddress);

    // DEPLOY THE SIMPLE WALLET
    const genereteApproveCallData = (
      erc20TokenAddress: Address,
      paymasterAddress: Address
    ) => {
      const approveData = encodeFunctionData({
        abi: [
          {
            inputs: [
              { name: "_to", type: "address" },
              { name: "_amount", type: "uint256" },
            ],
            name: "mint",
            outputs: [{ name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        args: [erc20TokenAddress, BigInt(32000000)],
      });

      // GENERATE THE CALLDATA TO APPROVE THE USDC
      const to = scrollToken;
      const value = BigInt(0);
      const data = approveData;

      const callData = encodeFunctionData({
        abi: [
          {
            inputs: [
              { name: "dest", type: "address" },
              { name: "value", type: "uint256" },
              { name: "func", type: "bytes" },
            ],
            name: "execute",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        args: [to, value, data],
      });

      return callData;
    };

    type HexString = `0x${string}`;

    /* const genereteSwapData = (
    erc20TokenAddress: Address,
    paymasterAddress: Address
  ) => {
    const commands = "0x0b00";
    const deadline = BigInt(1716654725);
    const inputs: HexString[] = [
      "0x0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000009184e72a000",
      "0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000009184e72a00000000000000000000000000000000000000000000000000000006de8846537e400000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bb4fbf271143f4fbf7b91a5ded31805e42b2208d60001f41f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000",
    ];
    //const inputsAsBytes = inputs.map((input) => ethers.utils.arrayify(input));
    const approveData = encodeFunctionData({
      abi: [
        {
          inputs: [
            { name: "commands", type: "bytes" },
            { name: "inputs", type: "bytes[]" },
            { name: "deadline", type: "uint256" },
          ],
          name: "execute",
          outputs: [{ name: "", type: "bool" }],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      args: [commands, inputs, deadline],
    });

    // GENERATE THE CALLDATA TO APPROVE THE USDC
    const to = erc20TokenAddress;
    const value = BigInt(0);
    const data = approveData;

    const callData = encodeFunctionData({
      abi: [
        {
          inputs: [
            { name: "dest", type: "address" },
            { name: "value", type: "uint256" },
            { name: "func", type: "bytes" },
          ],
          name: "execute",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      args: [to, value, data],
    });

    return callData;
  }; */

    const submitUserOperation = async (userOperation: UserOperation) => {
      try {
        const userOperationHash = await bundlerClient.sendUserOperation({
          userOperation,
          entryPoint: ENTRY_POINT_ADDRESS,
        });
        console.log(`UserOperation submitted. Hash: ${userOperationHash}`);

        console.log("Querying for receipts...");
        const receipt = await bundlerClient.waitForUserOperationReceipt({
          hash: userOperationHash,
        });
        await receipt.wait();
        console.log(
          `Receipt found!\nTransaction hash: ${receipt.receipt.transactionHash}`
        );
        return receipt.receipt.transactionHash;
      } catch (error) {
        console.log("error", error);
        return false;
      }
    };

    const senderUsdcBalance = await publicClient.readContract({
      abi: [
        {
          inputs: [{ name: "_account", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "balance", type: "uint256" }],
          type: "function",
          stateMutability: "view",
        },
      ],
      address: scrollToken,
      functionName: "balanceOf",
      args: [senderAddress],
    });
    const approveCallData = genereteApproveCallData(
      senderAddress,
      erc20PaymasterAddress
    );
    //const execCallData = genereteSwapData(uniswapRouter, erc20PaymasterAddress);

    // FILL OUT THE REMAINING USEROPERATION VALUES
    let gasPriceResult:any = {}
    try {
      gasPriceResult = await bundlerClient.getUserOperationGasPrice();
    } catch (error) {
      console.log("error", error);
      
    }

    const nonce = await getAccountNonce(publicClient, {
      sender: senderAddress,
      entryPoint: ENTRY_POINT_ADDRESS,
    });
    if (nonce !== BigInt(0)) {
      initCode = "0x";
    }
    const userOperation: Partial<UserOperation> = {
      sender: senderAddress,
      nonce,
      initCode,
      callData: approveCallData,
      maxFeePerGas: gasPriceResult.fast.maxFeePerGas,
      maxPriorityFeePerGas: gasPriceResult.fast.maxPriorityFeePerGas,
      paymasterAndData: "0x",
      signature:
        "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
    };

    const result = await paymasterClient.sponsorUserOperation({
      userOperation: userOperation as UserOperation,
      entryPoint: ENTRY_POINT_ADDRESS,
    });

    userOperation.preVerificationGas = result.preVerificationGas;
    userOperation.verificationGasLimit = result.verificationGasLimit;
    userOperation.callGasLimit = result.callGasLimit;
    userOperation.paymasterAndData = result.paymasterAndData;

    // SIGN THE USEROPERATION
    const signature = await signUserOperationHashWithECDSA({
      account: signer,
      userOperation: userOperation as UserOperation,
      chainId: scrollSepolia.id,
      entryPoint: ENTRY_POINT_ADDRESS,
    });

    userOperation.signature = signature;
    await submitUserOperation(userOperation as UserOperation);

    console.log("balance = ", senderUsdcBalance);
  } catch (error) {
    console.log("error", error);
  }
}
