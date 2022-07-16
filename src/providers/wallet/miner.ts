import Minercraft from 'minercraft'

let miner 

if (!miner) {
  miner = new Minercraft({
    "url": "https://merchantapi.taal.com",
    headers: {
      // The following token value is a "free trial" value. For more info visit https://developers.dotwallet.com/en/dev/api/merchant
      Authorization: "mainnet_9d2eefbd414c44fdc1d19b6d6cc4b3f8"
    }
  })  
}

export default miner
