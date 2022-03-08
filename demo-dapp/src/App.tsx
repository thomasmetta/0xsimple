import React, { useState } from "react";
import { ethers } from "ethers";

import { sequence } from "0xsequence";

import { ETHAuth, Proof } from "@0xsequence/ethauth";
import GAME_ABI from "./GameItems.json";

import { configureLogger } from "@0xsequence/utils";
import { Button } from "./components/Button";
import { styled, typography } from "./style";

import logoUrl from "./images/logo.svg";
import { Group } from "./components/Group";

configureLogger({ logLevel: "DEBUG" });

const App = () => {
  const [selectedMetaData, setSelectedMetaData] = useState(null);

  const [inputs, setInputs] = useState({
    tokenId: null,
    maxSupply: null,
    name: null,
    description: null,
  });

  const network = "rinkeby";
  const gameContractAddress = "0xD4fE9BBC942266BFB0734a0DE61F8ccc96B13fba"; // (Game address on Rinkeby

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

  const handleChange = (e: any) =>
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));

  const uploadAndSetMetaData = async (event: any) => {
    if (event && event.target && event.target.files) {
      const file = event.target.files[0];

      const form = new FormData();

      form.append("file", file);
      const options = {
        method: "POST",
        body: form,
        headers: {
          Authorization: "",
        },
      };

      const imageFileData = await fetch(
        "https://api.nftport.xyz/v0/files",
        options
      ).then((response) => response.json());

      const metaDataOptions = {
        method: "POST",
        body: JSON.stringify({
          name: inputs.name,
          description: inputs.description,
          file_url: imageFileData.ipfs_url,
        }),
        headers: {
          Authorization: "",
        },
      };

      const nftMetaData = await fetch(
        "https://api.nftport.xyz/v0/metadata",
        metaDataOptions
      ).then((response) => response.json());

      setSelectedMetaData(nftMetaData.metadata_uri);
      console.log(nftMetaData.metadata_uri);
    }
  };

  const createToken = async () => {
    const signer = wallet.getSigner(); // select DefaultChain signer by default

    const tx: sequence.transactions.Transaction = {
      delegateCall: false,
      revertOnError: false,
      gasLimit: "0x55555",
      to: gameContractAddress,
      value: 0,
      data: new ethers.utils.Interface(GAME_ABI).encodeFunctionData(
        "createToken",
        [inputs.tokenId, selectedMetaData, inputs.maxSupply]
      ),
    };
    const txnResp = await signer.sendTransactionBatch([tx]);
    await txnResp.wait();
  };

  const claim1155Tokens = async (signer?: sequence.provider.Web3Signer) => {
    signer = signer || wallet.getSigner(); // select DefaultChain signer by default

    const tx: sequence.transactions.Transaction = {
      delegateCall: false,
      revertOnError: false,
      gasLimit: "0x55555",
      to: gameContractAddress,
      value: 0,
      data: new ethers.utils.Interface(GAME_ABI).encodeFunctionData("claim", [
        0,
      ]),
    };

    const txnResp = await signer.sendTransactionBatch([tx]);
    await txnResp.wait();
  };

  console.log(inputs);

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
      </Group>

      <Group label="Create token" layout="grid">
        <Group layout="rows">
          <SubTitle>Name:</SubTitle>
          <input
            name="name"
            value={inputs.name || ""}
            onChange={handleChange}
          />

          <SubTitle>Description:</SubTitle>
          <input
            name="description"
            value={inputs.description || ""}
            onChange={handleChange}
          />

          <SubTitle>Upload asset</SubTitle>
          <input
            type="file"
            name="myImage"
            onChange={(event) => {
              uploadAndSetMetaData(event);
            }}
          />
        </Group>
        <Group layout="rows">
          <SubTitle>Token Id:</SubTitle>
          <input
            name="tokenId"
            value={inputs.tokenId || ""}
            onChange={handleChange}
          />

          <SubTitle>Max Supply:</SubTitle>
          <input
            name="maxSupply"
            value={inputs.maxSupply || ""}
            onChange={handleChange}
          />
        </Group>
        <Group layout="rows">
          <Button onClick={() => createToken()}>Create token</Button>
        </Group>
      </Group>

      <Group label="Transactions" layout="grid">
        <Button onClick={() => claim1155Tokens()}>Claim ERC-1155 Tokens</Button>
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

const SubTitle = styled("h2", typography.h2, {
  color: "$textPrimary",
  fontSize: "20px",
});

const Description = styled("p", typography.b1, {
  color: "$textSecondary",
  marginBottom: "15px",
});

export default React.memo(App);
