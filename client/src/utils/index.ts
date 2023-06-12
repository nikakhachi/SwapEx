import { BigNumberish, ethers } from "ethers";

export const shortenAddress = (address: string) => (address ? `${address.slice(0, 10)}...${address.slice(address.length - 5)}` : "");

export const bigNumberToNumber = (n?: BigNumberish) => (n ? Number(ethers.formatUnits(n)) : 0);

export const bigNumberToString = (n?: BigNumberish) => (n ? ethers.formatUnits(n) : "0");
