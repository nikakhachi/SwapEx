# SwapEx

A decentralized exchange (DEX) powered by a Constant Product AMM. Seamlessly swap tokens, provide liquidity, and utilize token faucets. Stake ETH with the Synthetic Staking Rewards Contract to earn rewards. Join SwapEx for a secure, censorship-resistant, and intermediary-free trading experience.

The contract is deployed on Goerli Network:

[Main Contract](https://goerli.etherscan.io/address/0x72d79543acF97aF49a33E06fFF52a754C9d895AC), [Faucet 0](https://goerli.etherscan.io/address/0xbeb912a858B399b851a0C59696189a62770845BE), [Faucet 1](https://goerli.etherscan.io/address/0xfBAf00e121DE495726295d456AdB9F6E2Ac4399f), [Staker Contract](https://goerli.etherscan.io/address/0xf209069af8f2f86c66E818A261495d672A99e7E4)

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Development](#development)
- [Contact](#contact)

## Features

- Smart contract deployment and interaction using Hardhat in Typescript
- Smart contract tests in Typescript
- User-friendly interface built with ReactJS in Typescript
- Web3 integration with Wagmi and EthersJS for seamless interaction with Ethereum network

## Prerequisites

Before running the dApp, ensure that you have the following installed:

- Node.js
- npm (Node Package Manager)
- MetaMask extension for your browser

## Getting Started

Follow the steps below to get the dApp up and running:

1. Clone this repository to your local machine.
2. Install the project dependencies by running `npm install` in the root directory as well as in `client` directory.
3. Configure your MetaMask extension to connect to the desired Ethereum network.
4. Deploy the smart contracts to the Ethereum network using Hardhat: `npx hardhat run scripts/deploy.js --network <network-name>`.
5. Update the addresses in files in `client/src/contracts/`.
6. Start the client: `cd client && npm run dev`.
7. Access the dApp by opening your browser and visiting `http://localhost:5173`.

## Usage

- Connect your desired wallet and approve the connection.
- Get the tokens from the faucet.
- Swap the tokens.
- Provide the liqudity and earn rewards.
- Stake ETH and earn rewards.
- View transaction history and account details.

## Development

To contribute to the development of this dApp, follow the steps below:

1. Fork this repository and clone it to your local machine.
2. Create a new branch for your changes: `git checkout -b my-new-feature`.
3. Get the dApp up and running following steps in [Getting Started](#getting-started).
4. Make the necessary modifications and additions.
5. Test Smart Contract with `npx hardhat test` in the root directory.
6. Commit and push your changes: `git commit -m 'Add some feature' && git push origin my-new-feature`.
7. Submit a pull request detailing your changes and their benefits.

## Contact

For any questions or inquiries, please contact [Nika Khachiashvili](mailto:n.khachiashvili1@gmail.com).
