var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "candy organ street obscure shed burst tail impulse guess glass chase race";

module.exports = {
  networks: {
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