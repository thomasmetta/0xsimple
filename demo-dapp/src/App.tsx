import React from "react";
import { ethers } from "ethers";

import { sequence } from "0xsequence";

import { ETHAuth, Proof } from "@0xsequence/ethauth";
import { ERC_20_ABI } from "./constants/abi";
import GAME_ABI from "./GameItems.json";
//import { sequenceContext } from '@0xsequence/network'

import { configureLogger } from "@0xsequence/utils";
import { Button } from "./components/Button";
import { styled, typography } from "./style";

import logoUrl from "./images/logo.svg";
import { Group } from "./components/Group";

configureLogger({ logLevel: "DEBUG" });

const App = () => {
  const network = "rinkeby";
  const wallet = new sequence.Wallet(network);

  // NOTE: to use mumbai, first go to https://sequence.app and click on "Enable Testnet".
  // As well, make sure to comment out any other `const wallet = ..` statements.
  // const network = 'mumbai'
  // const wallet = new sequence.Wallet(network)

  // Example of changing the walletAppURL
  // const wallet = new sequence.Wallet(network, { walletAppURL: 'https://sequence.app' })

  wallet.on("message", (message) => {
    console.log("wallet event (message):", message);
  });

  wallet.on("accountsChanged", (p) => {
    console.log("wallet event (accountsChanged):", p);
  });

  wallet.on("chainChanged", (p) => {
    console.log("wallet event (chainChanged):", p);
  });

  wallet.on("connect", (p) => {
    console.log("wallet event (connect):", p);
  });

  wallet.on("disconnect", (p) => {
    console.log("wallet event (disconnect):", p);
  });

  wallet.on("open", (p) => {
    console.log("wallet event (open):", p);
  });

  wallet.on("close", (p) => {
    console.log("wallet event (close):", p);
  });

  const connect = async (authorize: boolean = false) => {
    const connectDetails = await wallet.connect({
      app: "Demo Dapp",
      authorize,
      // keepWalletOpened: true
    });

    console.warn("connectDetails", { connectDetails });

    if (authorize) {
      const ethAuth = new ETHAuth();

      if (connectDetails.proof) {
        const decodedProof = await ethAuth.decodeProof(
          connectDetails.proof.proofString,
          true
        );

        console.warn({ decodedProof });

        const isValid = await wallet.utils.isValidTypedDataSignature(
          await wallet.getAddress(),
          connectDetails.proof.typedData,
          decodedProof.signature,
          await wallet.getAuthChainId()
        );
        console.log("isValid?", isValid);
        if (!isValid) throw new Error("sig invalid");
      }
    }
  };

  const disconnect = () => {
    wallet.disconnect();
  };

  const openWallet = () => {
    wallet.openWallet();
  };

  const closeWallet = () => {
    wallet.closeWallet();
  };

  const isConnected = async () => {
    console.log("isConnected?", wallet.isConnected());
  };

  const isOpened = async () => {
    console.log("isOpened?", wallet.isOpened());
  };

  const getDefaultChainID = async () => {
    console.log("TODO");
  };

  const getAuthChainID = async () => {
    console.log("TODO");
  };

  const getChainID = async () => {
    console.log("chainId:", await wallet.getChainId());

    const provider = wallet.getProvider();
    console.log("provider.getChainId()", await provider!.getChainId());

    const signer = wallet.getSigner();
    console.log("signer.getChainId()", await signer.getChainId());
  };

  const getAccounts = async () => {
    console.log("getAddress():", await wallet.getAddress());

    const provider = wallet.getProvider();
    console.log("accounts:", await provider!.listAccounts());
  };

  const getBalance = async () => {
    const provider = wallet.getProvider();
    const account = await wallet.getAddress();
    const balanceChk1 = await provider!.getBalance(account);
    console.log("balance check 1", balanceChk1.toString());

    const signer = wallet.getSigner();
    const balanceChk2 = await signer.getBalance();
    console.log("balance check 2", balanceChk2.toString());
  };

  const getWalletState = async () => {
    console.log("wallet state:", await wallet.getSigner().getWalletState());
  };

  const getNetworks = async () => {
    console.log("networks:", await wallet.getNetworks());
  };

  const createToken = async () => {
    const signer = wallet.getSigner(); // select DefaultChain signer by default

    const gameContractAddress = "0x02Ce10542B0f787438175c42F02111FF3Bbc0F8f"; // (Game address on Rinkeby)

    const tx: sequence.transactions.Transaction = {
      delegateCall: false,
      revertOnError: false,
      gasLimit: "0x55555",
      to: gameContractAddress,
      value: 0,
      data: new ethers.utils.Interface(GAME_ABI).encodeFunctionData(
        "createToken",
        [
          1,
          "ipfs://bafkreieggymjltgxgwyxulsuxor7hhy62cgrbq6vsna3cmroupm5jpg7mi",
          5,
        ]
      ),
    };

    const txnResp = await signer.sendTransactionBatch([tx]);
    await txnResp.wait();
  };

  const claim1155Tokens = async (signer?: sequence.provider.Web3Signer) => {
    signer = signer || wallet.getSigner(); // select DefaultChain signer by default

    const gameContractAddress = "0x02Ce10542B0f787438175c42F02111FF3Bbc0F8f"; // (Game address on Rinkeby)

    const tx: sequence.transactions.Transaction = {
      delegateCall: false,
      revertOnError: false,
      gasLimit: "0x55555",
      to: gameContractAddress,
      value: 0,
      data: new ethers.utils.Interface(GAME_ABI).encodeFunctionData("claim", [
        1,
      ]),
    };

    const txnResp = await signer.sendTransactionBatch([tx]);
    await txnResp.wait();
  };

  return (
    <Container>
      <SequenceLogo alt="logo" src={logoUrl} />

      <Title>
        Demo Dapp ({network && network.length > 0 ? network : "mainnet"})
      </Title>
      <Description>
        Please open your browser dev inspector to view output of functions below
      </Description>

      <Group label="Connection" layout="grid">
        <Button onClick={() => connect()}>Connect</Button>
        <Button onClick={() => connect(true)}>Connect & Auth</Button>
        <Button onClick={() => disconnect()}>Disconnect</Button>
        <Button onClick={() => openWallet()}>Open Wallet</Button>
        <Button onClick={() => closeWallet()}>Close Wallet</Button>
        <Button onClick={() => isConnected()}>Is Connected?</Button>
        <Button onClick={() => isOpened()}>Is Opened?</Button>
        <Button onClick={() => getDefaultChainID()}>DefaultChain?</Button>
        <Button onClick={() => getAuthChainID()}>AuthChain?</Button>
      </Group>

      <Group label="State" layout="grid">
        <Button onClick={() => getChainID()}>ChainID</Button>
        <Button onClick={() => getNetworks()}>Networks</Button>
        <Button onClick={() => getAccounts()}>Get Accounts</Button>
        <Button onClick={() => getBalance()}>Get Balance</Button>
        <Button onClick={() => getWalletState()}>Get Wallet State</Button>
      </Group>

      <Group label="Create token" layout="grid">
        <Button onClick={() => createToken()}>Create token</Button>
      </Group>

      <Group label="Transactions" layout="grid">
        <Button onClick={() => claim1155Tokens()}>Claim ERC-1155 Tokens</Button>
        {/* <Button onClick={() => sendBatchTransaction()}>Send Batch Txns</Button> */}
      </Group>
    </Container>
  );
};

const Container = styled("div", {
  padding: "80px 25px 80px",
  margin: "0 auto",
  maxWidth: "720px",
});

const SequenceLogo = styled("img", {
  height: "40px",
});

const Title = styled("h1", typography.h1, {
  color: "$textPrimary",
  fontSize: "25px",
});

const Description = styled("p", typography.b1, {
  color: "$textSecondary",
  marginBottom: "15px",
});

export default React.memo(App);
