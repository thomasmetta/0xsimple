import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import { sequence } from "0xsequence";

import { ETHAuth, Proof } from "@0xsequence/ethauth";
import GAME_ABI from "./GameItems.json";

import { configureLogger } from "@0xsequence/utils";
import { Button } from "./components/Button";
import { styled, typography } from "./style";

import logoUrl from "./images/logo.svg";
import ipfsLogoUrl from "./images/ipfs.svg";
import polygonLogoUrl from "./images/polygon.svg";

import { Group } from "./components/Group";

configureLogger({ logLevel: "DEBUG" });

const App = () => {
  const [collectionMetaData, setCollectionMetaData] = useState<any>([]);

  const network = "polygon";
  const gameContractAddress =
    "0x69965DA127E9ACA34cED1c94a57856172150DbCd".toLowerCase(); // (Game address on polygon

  const wallet = new sequence.Wallet(network);

  const indexer = new sequence.indexer.SequenceIndexerClient(
    "https://polygon-indexer.sequence.app"
  );

  const metadata = new sequence.metadata.SequenceMetadataClient(
    "https://metadata.sequence.app"
  );

  useEffect(() => {
    async function fetchMetaData() {
      const accountAddress = await wallet.getAddress();

      const { balances } = await indexer.getTokenBalances({
        contractAddress: gameContractAddress,
        accountAddress: accountAddress,
      });

      const accountBalanceTokenIds = balances.map((balance) => {
        if (gameContractAddress == balance.contractAddress) {
          return balance.tokenID;
        }
      });

      const { tokenIDs } = await indexer.getTokenSupplies({
        contractAddress: gameContractAddress,
      });

      const tokenSupplyTokenIds = tokenIDs.map((tokenId) => tokenId.tokenID);

      const tokenIds = tokenSupplyTokenIds.filter(
        (x: any) => !accountBalanceTokenIds.includes(x)
      );

      const chainID = await wallet.getChainId();

      const { contractInfoMap } = await metadata.getContractInfoBatch({
        chainID: JSON.stringify(chainID),
        contractAddresses: [gameContractAddress],
      });

      const contractAddress = Object.keys(contractInfoMap);
      const contractTokenMap: any = {};

      contractAddress.forEach((address) => {
        contractTokenMap[address] = tokenIds;
      });

      const { contractTokenMetadata } = await metadata.getTokenMetadataBatch({
        chainID: JSON.stringify(chainID),
        contractTokenMap: contractTokenMap,
      });

      setCollectionMetaData(contractTokenMetadata[gameContractAddress]);
    }

    fetchMetaData();
  }, []);

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

  const claim1155Tokens = async (tokenId: string) => {
    const signer = wallet.getSigner(); // select DefaultChain signer by default

    const tx: sequence.transactions.Transaction = {
      delegateCall: false,
      revertOnError: false,
      gasLimit: "0x55555",
      to: gameContractAddress,
      value: 0,
      data: new ethers.utils.Interface(GAME_ABI).encodeFunctionData("claim", [
        tokenId,
      ]),
    };

    const txnResp = await signer.sendTransactionBatch([tx]);
    await txnResp.wait();
  };

  return (
    <Container>
      <Title>
        0xSimple Gaming ({network && network.length > 0 ? network : "mainnet"})
      </Title>
      <Description>Get exclusive FREE in-game loot</Description>

      <Group label="Connection" layout="grid">
        <Button onClick={() => connect()}>Connect</Button>
        <Button onClick={() => connect(true)}>Connect & Auth</Button>
        <Button onClick={() => disconnect()}>Disconnect</Button>
        <Button onClick={() => openWallet()}>Open Wallet</Button>
        <Button onClick={() => closeWallet()}>Close Wallet</Button>
      </Group>

      <Group label="Current Offering" layout="rows">
        {collectionMetaData.map((item: any) => {
          return (
            <Item key={item.tokenId}>
              <img src={item.image} alt={item.name} />
              <Title>Title: {item.name}</Title>
              <Description>Description: {item.description}</Description>
              <Description>Token Id: {item.tokenId}</Description>
              <Button onClick={() => claim1155Tokens(item.tokenId)}>
                Claim Token
              </Button>
            </Item>
          );
        })}
      </Group>

      <Footer> Power By </Footer>
      <Logo alt="logo" src={logoUrl} />
      <Logo alt="logo" src={ipfsLogoUrl} />
      <Logo alt="logo" src={polygonLogoUrl} />
    </Container>
  );
};

const Container = styled("div", {
  padding: "80px 25px 80px",
  margin: "0 auto",
  maxWidth: "720px",
});

const Logo = styled("img", {
  height: "40px",
  marginRight: "20px",
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

const Item = styled("div", {
  color: "$textSecondary",
  borderStyle: "solid",
  width: "500px",
  padding: "50px",
});

const Footer = styled("p", typography.b1, {
  color: "$textSecondary",
  marginBottom: "10px",
});

export default React.memo(App);
