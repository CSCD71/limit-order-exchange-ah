[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/pau2dqk-)

# Limit Order Exchange

* **Deployed dApp:** [https://cscd71.github.io/limit-order-exchange-ah](https://cscd71.github.io/limit-order-exchange-ah)
* **Verified Sepolia Smart Contract:** [https://sepolia.etherscan.io/address/0x1f27F28F7571d840Fb5fa6BAc76a7e87783C8F64](https://sepolia.etherscan.io/address/0x1f27F28F7571d840Fb5fa6BAc76a7e87783C8F64)

## Installing Dependencies

Follow these steps to install all dependencies:

1. Install Solidity dependencies (OpenZeppelin here) 

```bash
forge install OpenZeppelin/openzeppelin-contracts
```
2. Install dependencies

  ```bash
  npm install
  ```
3. Compile the Solidity contracts

  ```bash
  forge build
  ```

## Running Unit Tests

To run the smart contract unit tests:

1. Start the local chain using `anvil` (in a separate terminal)

  ```bash
  anvil
  ```
  
2. Run the unit tests

  ```bash
  npm test
  ```
  
## Deploying the Smart Contract to Sepolia

Use the same steps used for deploying Auction House to the Sepolia test network:

### Prerequisites

To deploy your app, you need two things:

- A private key account with some Sepolia ETH. There are different wallets for Ethereum; we are going to use [MetaMask](https://metamask.io/) here.
- An RPC endpoint for sending queries and transactions to the Ethereum Sepolia network. There are several Ethereum RPC providers such as [Alchemy](https://www.alchemy.com/) (our choice here) and [Infura](https://www.infura.io/).

1. Install MetaMask, create a wallet, and [export your private key](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key).

2. Provision your account with Sepolia ETH. To get those ETH, you can use a faucet such as [Google Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) or [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/).

3. Create an account on [Alchemy](https://www.alchemy.com/), then create and export an API key for Sepolia.

#### Setup

1. Create an `.env` file and set `ALCHEMY_API_KEY`:

  ```
  ALCHEMY_API_KEY=
  ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}
  ```

2. Load this `.env` file:

  ```bash
  source .env
  ```

3. Verify that your RPC endpoint works. This command should show the Sepolia chain ID `11155111`:

  ```bash
  cast chain-id --rpc-url $ALCHEMY_RPC_URL
  ```

4. Record your key inside the Foundry keystore (use a strong password):

  ```bash
  cast wallet import deployer --private-key your_private_key
  ```

5. Check your balance on Sepolia and make sure that you have at least 0.01 ETH on your account:

  ```
  cast balance \
    --rpc-url $ALCHEMY_RPC_URL \
    --ether $(cast wallet address --account deployer)
  ```

### Deploy the Contract

```bash
forge create contracts/AuctionHouse.sol:AuctionHouse \
  --rpc-url $ALCHEMY_RPC_URL \
  --account deployer \
  --broadcast
```

This should give the following output:

```bash
Deployer: <ACCOUNT_ADDRESS>
Deployed to: <DEPLOYED_ADDRESS>
Transaction hash: <TX_HASH>
```

Your contract has been deployed to `<DEPLOYED_ADDRESS>` and `<TX_HASH>` contains the transaction that includes the deployment.

You can look at this contract on Etherscan: 

```
https://sepolia.etherscan.io/address/<DEPLOYED_ADDRESS>
```

And the transaction hash:

```
https://sepolia.etherscan.io/tx/<TX_HASH>
```

Edit the file `static/config.json` and update the contract's address and transaction hash for the Sepolia chain (`11155111`):

```
{
    "11155111": {
        "address": "<DEPLOYED_ADDRESS>",
        "hash": "<TX_HASH>"
    } 
}
```

## Running the dApp Frontend Locally

To start the frontend locally:

1. Install dependencies
  ```bash
  npm install
  ```
2. Start the local development server:
  ```bash
  browser-sync start --server --files "**/*" --port 3000
  ```
3. Open the app in your browser:
  ```bash
  http://localhost:3000
  ```