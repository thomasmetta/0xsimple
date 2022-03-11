import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import { sequence } from "0xsequence";

import { ETHAuth } from "@0xsequence/ethauth";
import GAME_ABI from "./GameItems.json";

import { configureLogger } from "@0xsequence/utils";
import { Button } from "./components/Button";
import { styled, typography } from "./style";

import { Footer } from "./components/Footer";
import { Group } from "./components/Group";
import { networkConfig } from "./networkConfig";

configureLogger({ logLevel: "DEBUG" });

const Admin = () => {
  const [selectedMetaData, setSelectedMetaData] = useState(null);
  const [collectionMetaData, setCollectionMetaData] = useState<any>([]);
  const [accountAddress, setAccountAddress] = useState<string>("");
  const [isIPFSUploadLoading, setIsIPFSUploadLoading] =
    useState<boolean>(false);

  const [inputs, setInputs] = useState({
    tokenId: null,
    maxSupply: null,
    name: null,
    description: null,
  });

  const network = "polygon";
  const gameContractOwnerAddress =
    networkConfig[network].gameContractOwnerAddress.toLowerCase();

  const gameContractAddress =
    networkConfig[network].gameContractAddress.toLowerCase();

  const wallet = new sequence.Wallet(network);

  const indexer = new sequence.indexer.SequenceIndexerClient(
    `https://${network}-indexer.sequence.app`
  );

  const metadata = new sequence.metadata.SequenceMetadataClient(
    "https://metadata.sequence.app"
  );

  const NFTPORT_API_KEY: any = process.env.REACT_APP_NFTPORT_API_KEY;

  useEffect(() => {
    async function fetchMetaData() {
      const accountAddress = await wallet.getAddress();
      setAccountAddress(accountAddress.toLocaleLowerCase());

      const { tokenIDs } = await indexer.getTokenSupplies({
        contractAddress: gameContractAddress,
      });

      const tokenIds = tokenIDs.map((tokenId) => tokenId.tokenID);

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

      setCollectionMetaData(
        contractTokenMetadata[gameContractAddress].reverse()
      );
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
      app: "0xSimple dashboard",
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

  const handleChange = (e: any) =>
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));

  const uploadAndSetMetaData = async (event: any) => {
    if (event && event.target && event.target.files) {
      setIsIPFSUploadLoading(true);
      const file = event.target.files[0];

      const form = new FormData();

      form.append("file", file);
      const options = {
        method: "POST",
        body: form,
        headers: {
          Authorization: NFTPORT_API_KEY,
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
          Authorization: NFTPORT_API_KEY,
        },
      };

      const nftMetaData = await fetch(
        "https://api.nftport.xyz/v0/metadata",
        metaDataOptions
      ).then((response) => response.json());

      setSelectedMetaData(nftMetaData.metadata_uri);
      console.log(nftMetaData.metadata_uri);
      if (nftMetaData) {
        setIsIPFSUploadLoading(false);
      }
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

  return (
    <Container>
      <Title>
        0xSimple Admin Dashboard (
        {network && network.length > 0 ? network : "mainnet"})
      </Title>

      <Group label="Connection" layout="grid">
        <Button onClick={() => connect()}>Connect</Button>
        <Button onClick={() => connect(true)}>Connect & Auth</Button>
        <Button onClick={() => disconnect()}>Disconnect</Button>
        <Button onClick={() => openWallet()}>Open Wallet</Button>
        <Button onClick={() => closeWallet()}>Close Wallet</Button>
      </Group>

      {accountAddress === gameContractOwnerAddress ? (
        <>
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
              {isIPFSUploadLoading && <SubTitle>Uploading</SubTitle>}
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
          (
          {collectionMetaData && (
            <Group label="Current Collection" layout="rows">
              {collectionMetaData.map((item: any) => {
                return (
                  <Item key={item.tokenId}>
                    <img src={item.image} alt={item.name} />
                    <Title>Title: {item.name}</Title>
                    <Description>Description: {item.description}</Description>
                    <Description>Token Id: {item.tokenId}</Description>
                  </Item>
                );
              })}
            </Group>
          )}
          )
        </>
      ) : (
        <SubTitle>You don't have admin right 😭</SubTitle>
      )}

      <Footer />
    </Container>
  );
};

const Container = styled("div", {
  padding: "80px 25px 80px",
  margin: "0 auto",
  maxWidth: "720px",
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
  paddingLeft: "150px",
});

export default React.memo(Admin);
