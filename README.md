0xSimple is a simple platform that allows game developers to create and manage their in-game asset. Gamer can use social/email login to claim free in-game asset (like Prime Gaming) in a non-custodial way without gas fee/wallet install.

Demo video: https://showcase.ethglobal.com/buildquest/loot-kit-98b3d

Live: https://www.0xsimple.com/claim

Opensea collection: https://opensea.io/collection/0xsimple-collection-v2

# `contract`

- Deployed to Polygon Mainnet https://polygonscan.com/token/0x69965da127e9aca34ced1c94a57856172150dbcd
- Uses openzeppelin ERC1155 + Ownable
- contractURI map to an IPFS that store the Top level collection Metadata (These are shown in the Sequence wallet collection as well
- Override the uri function so it can use dynamic IPFS
- The URL + token supply can only be set once by the admin
- Only admin able to call createToken that set the supply and url
- Only admin able to set allowlist (By default, there’s no allowlist)
- If there’s an allowlist and the msg sender is not part of the list, they won’t be able to mint
- The claim function also check the availableSupply and decrease it once minted

# `demo-dapp`

Bootstrapped with the [demo app from Sequence](https://0xsequence.github.io/demo-dapp)

## Usage

1. yarn
2. yarn start
3. Open browser to http://localhost:4000 to access the demo dapp

## Development

- Admin page
  - On the frontend, only if the connected wallet address matches the admin address, we should the create token options
  - User will first upload the file image using NFTPort file upload endpoint. Once the image is uploaded successfully, we use the NFTPort upload metadata endpoint to upload the metadata with name, description and image url.
  - When clicking create token, it calls createToken() smart contract function which include token id, metadata url, maxSupply)
  - The createToken() transaction fee is free since it’s relaying through Sequence relayer and since the fee is super cheap on Polygon, we are able to subsidized it.
  - Sequence relayer also took care of gas free estimation to ensure fast transaction on Polygon
  - In the current collection section, it uses the Sequence indexer + metadata library. Show most up-to-date collection (1 block time)
  - First it fetches all the token ids by getting the token supplies given the collection smart contract address, then we get the contract info, and finally we get the token metadata in batch using the contract info. We then renders all the token metadata inside the current collection section
- Claim page
  - On the frontend, anyone can connect to the app without wallet install (eg Metamask), they can connect using email or social login like Twitch using the Sequence wallet
  - Once the user is connected, it uses the Sequence indexer + metadata library to fetch the current offering section (1 block time, no delay)
  - Given the gamer’s account address, we fetch the token ids with the account balance. We then filter out any assets that users already own so we don’t show “already claimed” offer on the frontend. There’s also a check in the smart contract to prevent user claiming the asset again. Once we have the unclaimed token ids, we renders those metadata in the current offering collection
  - When clicking claim, it calls claim by passing in the tokenID. It first check if the gamer account address is within the allowlist if it was set (By default, every address is whitelisted). It checked if the user already claimed the token, if the token still have available supply. If those assertion is passed, we then decrease the available supply, and mint the gamer a token

## LICENSE

Apache 2.0 or MIT (your choice)
