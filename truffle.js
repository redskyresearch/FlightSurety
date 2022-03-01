var Web3 = require('web3')
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "candy organ street obscure shed burst tail impulse guess glass chase race";

module.exports = {
  networks: {

/*
    development: {

      // host: "127.0.0.1",     // Localhost (default: none)

      // port: 7545,            // Standard Ethereum port (default: none)

      provider: function() {

        return new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545/");

      },

      gas: 6666666,

      network_id: "*",       // Any network (default: none)

      websockets: true

    }
*/


    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/", 0, 50);
        },
        host: "127.0.0.1",     // Localhost (default: none)
        port: 7545,            // Standard Ethereum port (default: none)
        network_id: "*",       // Any network (default: none)
    }

  },
  compilers: {
    solc: {
      version: "^0.8.0"
    }
  }
};