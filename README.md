# eddsa-metamask-plugin

A MetaMask plugin for signing EdDSA data. Currently only works in the [MetaMask Snaps](https://github.com/MetaMask/metamask-extension/tree/snaps). More information can be found in the [wiki](https://github.com/MetaMask/metamask-snaps-beta/wiki).

## How to use this plugin

- [Install the MetaMask Extension - Snaps branch](https://github.com/MetaMask/metamask-extension/tree/snaps)
- [Install the Metamask snaps-skunkworks](https://github.com/MetaMask/snaps-skunkworks)
- Clone this repo
- Go to the root folder of this repo
- Run `npm install`
- Run `mm-snap build` and then `mm-snap serve`
- Browse to `localhost:8085` in the browser you installed the MetaMask Beta in
- Follow the intstructions given on the website

This plugin uses a very slightly modified [snarkjs](https://github.com/iden3/snarkjs) package found [here](https://github.com/Brechtpd/snarkjs). The modifications were done to make the package compatible with [SES (Secure EcmaScript)](https://github.com/Agoric/SES).

- After `npm install`, go and find `calculateWitnes.js` file inside `node_modules` and remove `-->` and `--->` otherwise `build` will not work (it isn't SES compatible).

- It works only with Chrome (Install Metamask extension on Chrome)

- It was updated to work with Metamask Snaps