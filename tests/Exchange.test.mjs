import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "crypto";

import { expect, describe, it, beforeAll, afterAll } from 'vitest';

import { createPublicClient, createWalletClient, http, getAddress, decodeEventLog, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";
import { mock } from "node:test";

const rpc = http("http://127.0.0.1:8545");
const client = await createPublicClient({ chain: foundry, transport: rpc });

const privateKeys = [
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
    "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
    "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
    "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356",
    "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
    "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6",
];

function loadContract(contract) {
  const content = readFileSync(join('out', `${contract}.sol`, `${contract}.json`), "utf8");
  const artifact = JSON.parse(content);
  return { abi: artifact.abi, bytecode: artifact.bytecode.object };
}

function randomNonce(bits = 256n) {
  const bytes = Number(bits / 8n);
  return BigInt("0x" + randomBytes(bytes).toString("hex"));
}

describe("Order Exchange", function () {

    let owner, seller, buyer; // wallets
    let contract; // contracts
    let mockToken1Contract, mockToken2Contract; // mock token contracts

    const receipts = [];

    afterAll(async () =>{
        if (receipts.length === 0) return;

        console.log("\n=== Gas / ETH cost summary ===");
        
        for (const {label, receipt} of receipts){
            const costWei = receipt.gasUsed * receipt.effectiveGasPrice;
            console.log(`• ${label}: ${receipt.gasUsed.toLocaleString()} gas`);
        }
        console.log("================================\n");
    });
    
    beforeAll(async () => {
        // create wallets
        [owner, seller, buyer] = await Promise.all(privateKeys.map(function(pk){
            return createWalletClient({ chain: foundry, transport: rpc , account: privateKeyToAccount(pk) });
        }));
        // compile the contract
        const { abi, bytecode } = loadContract("Exchange");
        const { abi: abiMck1, bytecode: bytecodeMck1 } = loadContract("Mock1ERC20");
        const { abi: abiMck2, bytecode: bytecodeMck2 } = loadContract("Mock2ERC20");
        // deploy contract
        const hash = await owner.deployContract({ abi, bytecode });
        const hashMck1 = await owner.deployContract({ abi: abiMck1, bytecode: bytecodeMck1 });
        const hashMck2 = await owner.deployContract({ abi: abiMck2, bytecode: bytecodeMck2 });
        // wait for the transaction to be confirmed
        const receipt = await client.waitForTransactionReceipt({ hash });
        receipts.push({label: "Deployment", receipt});
        const receiptMck1 = await client.waitForTransactionReceipt({ hash: hashMck1 });
        const receiptMck2 = await client.waitForTransactionReceipt({ hash: hashMck2 });
        const config = {};
        const address = receipt.contractAddress;
        const mockToken1Address = receiptMck1.contractAddress;
        const mockToken2Address = receiptMck2.contractAddress;
        contract = { address, abi };
        mockToken1Contract = { address: mockToken1Address, abi: abiMck1 };
        mockToken2Contract = { address: mockToken2Address, abi: abiMck2 };
        // write config for testing frontend
        config[foundry.id] = { contract: address, hash };
        writeFileSync('./static/config.json', JSON.stringify(config));
    })
    

    describe("Sell Tests", function () {   
        let receipt;
        let amountA, amountB, expiry, nonce;

        beforeAll(async () => {
            const { address: mockToken1Address, abi: abiMck1 } = mockToken1Contract;
            const { address: mockToken2Address, abi: abiMck2 } = mockToken2Contract;
            const mockHash1 = await owner.writeContract({ address: mockToken1Address, abi: abiMck1, functionName: "mint", args:[seller.account.address, parseUnits("1000", 18)] });
            const mockHash2 = await owner.writeContract({ address: mockToken2Address, abi: abiMck2, functionName: "mint", args:[buyer.account.address, parseUnits("1000", 18)] });
            await client.waitForTransactionReceipt({ hash: mockHash1 });
            await client.waitForTransactionReceipt({ hash: mockHash2 });
            const { address, abi } = contract;
            amountA = parseUnits("10", 18);
            amountB = parseUnits("5", 18);
            expiry = BigInt(Math.floor(Date.now() / 1000) + 3600);
            nonce = randomNonce();
            const order = {
                seller: seller.account.address,
                tokenA: mockToken1Address,
                tokenB: mockToken2Address,
                amountA,
                amountB,
                expiry,
                nonce,
            };

            const signature = await seller.signTypedData({
                domain: {
                    name: "D21P2",
                    version: "1",
                    chainId: foundry.id,
                    verifyingContract: address,
                },
                types: {
                    Order: [
                    { name: "seller", type: "address" },
                    { name: "tokenA", type: "address" },
                    { name: "tokenB", type: "address" },
                    { name: "amountA", type: "uint256" },
                    { name: "amountB", type: "uint256" },
                    { name: "expiry", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    ],
                },
                primaryType: "Order",
                message: order,
            });

            const hash = await owner.writeContract({
                address,
                abi,
                functionName: "sellOrder",
                args: [order, signature, true],
            });
            receipt = await client.waitForTransactionReceipt({ hash });
            receipts.push({label: "SellOrder 1", receipt});
        });  

        it("Should have emitted an event after a successful sell order", async function () {
            const { abi } = contract;
            // check the logs looking of events
            expect(receipt.logs).toHaveLength(1);
            const log = receipt.logs[0];
            // parse and check event
            const { args, eventName } = decodeEventLog({abi, data: log.data, topics: log.topics });
            const { address: mockToken1Address } = mockToken1Contract;
            const { address: mockToken2Address } = mockToken2Contract;
            expect(eventName).to.equal('PublishOrder');
            expect(args._seller).to.equal(seller.account.address);
            expect(args._tokenA.toLowerCase()).to.equal(mockToken1Address.toLowerCase());
            expect(args._tokenB.toLowerCase()).to.equal(mockToken2Address.toLowerCase());
            expect(args._amountA).to.equal(amountA);
            expect(args._amountB).to.equal(amountB);
            expect(args._expiry).to.equal(expiry);
            expect(args._nonce).to.equal(nonce);
      	});
    });
});