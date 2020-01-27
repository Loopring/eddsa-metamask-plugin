# eddsa-metamask-plugin

A MetaMask plugin for signing EdDSA data. Currently only works in the [MetaMask Plugin Beta](https://github.com/MetaMask/metamask-snaps-beta). More information can be found in the [wiki](https://github.com/MetaMask/metamask-snaps-beta/wiki).

## How to use this plugin

- [Install the MetaMask Snaps Beta](https://github.com/MetaMask/metamask-snaps-beta/wiki/Getting-Started)
- Clone this repo
- Go to the root folder of this repo
- Run `npm install`
- Run `mm-snap build` and then `mm-snap serve`
- Browse to `localhost:8085` in the browser you installed the MetaMask Beta in
- Follow the intstructions given on the website

This plugin uses a very slightly modified [snarkjs](https://github.com/iden3/snarkjs) package found [here](https://github.com/Brechtpd/snarkjs). The modifications were done to make the package compatible with [SES (Secure EcmaScript)](https://github.com/Agoric/SES).