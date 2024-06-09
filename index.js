const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
const TronWeb = require('tronweb')
let mainnet = 'https://api.trongrid.io'

const NETWORK = mainnet

async function solanaTransaction(SolanaTransaction){
  const userAccount = SolanaTransaction;

  let base_url = `https://api.helius.xyz/v0/addresses/${userAccount}/transactions?api-key=0570c943-5cbf-4ff4-9397-02270f156e68`;
  let url = base_url;
  let lastSignature = null;

  const response = await fetch(url);
  const transactions = await response.json();
  const result = transactions.map(transaction => {
    if (!transaction.tokenTransfers || !transaction.nativeTransfers) {
      console.error('Invalid transaction format', transaction);
      return null;
    }
    const nativeBalanceChange = transaction.nativeTransfers.reduce((acc, transfer) => {
      const amount = transfer.fromUserAccount === userAccount ? transfer.amount : transfer.amount;
      let value = (acc + amount) / 1000000000;
      return value;
    }, 0);

    const tokenChange = transaction.tokenTransfers.reduce((acc, transfer) => {
      const amount = transfer.fromUserAccount === userAccount ? transfer.tokenAmount : transfer.tokenAmount;
      return acc + amount;
    }, 0);
    var sendRecieve = transaction.feePayer.toLowerCase() === userAccount.toLowerCase() ? 'Sent' : 'Received'

    return {
      type: transaction.type,
      signature: transaction.signature,
      timestamp: parseInt(transaction.timestamp),
      nativeBalanceChange,
      tokenChange,
      sendRecieve,
      Blockchain :"Solana"
    };
  });
  return result;
  // console.log(result);
  

}
async function tronTransaction(addressTron)
{
  const NETWORK = 'https://api.trongrid.io';
  const tronWeb = new TronWeb({
    fullHost: NETWORK,
  });
  address = addressTron;
  try {
    const url = `${NETWORK}/v1/accounts/${address}/transactions?only_confirmed=true&limit=10&order_by=block_timestamp,desc`;
    const fet = await fetch(url);
    const response = await fet.json();
    const transactions = response.data.map(tx => {
      const contract = tx.raw_data.contract[0];
      const sender = tronWeb.address.fromHex(contract.parameter.value.owner_address);
      const recipient = tronWeb.address.fromHex(contract.parameter.value.to_address);
      return {
        type: contract.type,
        signature: tx.txID,
        timestamp: parseInt(tx.raw_data.timestamp),
        nativeBalanceChange: contract.parameter.value.amount ? tronWeb.fromSun(contract.parameter.value.amount) : 'N/A',
        tokenChange: "0",
        senderOrReceiver: address.toLowerCase() === sender.toLowerCase() ? 'Sent' : 'Received',
        blockchain : "Tron"
      };
    });

    return transactions;
  } catch (error) {
    console.error('Failed to get transactions:', error);
    return ({
      error: "Failed to retrieve transactions."
    });
  }
}
async function getEVMtransactionBNB(address) {
  try {
    walletAddress = address;
    // const web3 = new Web3(new Web3.providers.HttpProvider(chain));

    let apiKey;
    let apiUrl;
    apiKey = "FBBJRWSBP1P4KIF6QJDHKZHHZPTE7R9WCB";
    apiUrl = `https://api.bscscan.com/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    // if (chain === "https://bsc.publicnode.com") {
    //   // For BSC, use BscScan API
    //   apiKey = "FBBJRWSBP1P4KIF6QJDHKZHHZPTE7R9WCB";
    //   apiUrl = `https://api.bscscan.com/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    // } else if (chain === "https://eth.drpc.org") {
    //   // For Ethereum, use Etherscan API
    //   apiKey = "FRK7H7B1WGN24HV3CY8CKDFUG5IE7XBXV6";
    //   apiUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    // }

    // Make the API request
    const fet = await fetch(apiUrl);
    const response = await fet.json();
    console.log(response)

    // Extract and format transaction details
    const transactions = response.result.slice(0, 50).map((tx) => ({
      type :  tx.functionName == ''
      ? "Transfer"
      : "Contract Interaction",
      tx: tx.hash,
      timestamp : parseInt(tx.timestamp),
      nativeBalanceChange : tx.value / 1000000000000000000,
      tokenChange : 0, 
      // to: tx.to,
      // from: tx.from,
      status: tx.txreceipt_status === "1" ? "Success" : "Failed",
      sendRecieve:
        tx.from.toLowerCase() === walletAddress.toLowerCase()
          ? "Sent"
          : "Received",
      blockchain : "BNB",
    }));

   return transactions;
  } catch (error) {
    console.error(error);
    
  }
}
async function getEVMtransactionETH(address) {
  try {
    walletAddress = address;
    // const web3 = new Web3(new Web3.providers.HttpProvider(chain));

    let apiKey;
    let apiUrl;
    apiKey = "FRK7H7B1WGN24HV3CY8CKDFUG5IE7XBXV6";
    apiUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    // if (chain === "https://bsc.publicnode.com") {
    //   // For BSC, use BscScan API
    //   apiKey = "FBBJRWSBP1P4KIF6QJDHKZHHZPTE7R9WCB";
    //   apiUrl = `https://api.bscscan.com/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    // } else if (chain === "https://eth.drpc.org") {
    //   // For Ethereum, use Etherscan API
    //   apiKey = "FRK7H7B1WGN24HV3CY8CKDFUG5IE7XBXV6";
    //   apiUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    // }

    // Make the API request
    const fet = await fetch(apiUrl);
    const response = await fet.json();
    console.log(response)

    // Extract and format transaction details
    const transactions = response.result.slice(0, 50).map((tx) => ({
      type :  tx.functionName == ''
      ? "Transfer"
      : "Contract Interaction",
      tx: tx.hash,
      timestamp : parseInt(tx.timestamp),
      nativeBalanceChange : tx.value / 1000000000000000000,
      tokenChange : 0, 
      // to: tx.to,
      // from: tx.from,
      status: tx.txreceipt_status === "1" ? "Success" : "Failed",
      sendRecieve:
        tx.from.toLowerCase() === walletAddress.toLowerCase()
          ? "Sent"
          : "Received",
      blockchain : "ETH",
    }));

   return transactions;
  } catch (error) {
    console.error(error);
    
  }
}
// getEVMtransaction()
app.get('/GetHistory', async (req, res) => {
  const EVM = req.query.evm;
  const TRON = req.query.tron;
  const Solana = req.query.solana;
  console.log(EVM,TRON,Solana)
 var solanadata =  await solanaTransaction(Solana);
 var trondata =  await tronTransaction(TRON);
 var bnb = await getEVMtransactionBNB(EVM);
 var eth = await getEVMtransactionETH(EVM);
//  const mergedTransactions = [...solanadata, ...trondata];
 const mergedTransactions = [bnb,eth,trondata,solanadata];

var data =  mergedTransactions.sort((a, b) => b.timestamp - a.timestamp);

 res.json(data);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});