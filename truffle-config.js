var Web3 = require('web3')
var HDWalletProvider = require("@truffle/hdwallet-provider");
//var mnemonic = "candy organ street obscure shed burst tail impulse guess glass chase race";
var mnemonic = "any ranch rival torch true ahead salon engage guess hybrid left wet";

module.exports = {
  networks: {


    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/", 0, 50);
        },
        network_id: "*",       // Any network (default: none)
        host: "127.0.0.1",     // Localhost (default: none)
        port: 7545,            // Standard Ethereum port (default: none)
        websockets: true
    }

  },
  compilers: {
    solc: {
      version: "^0.8.0"
    }
  }
};