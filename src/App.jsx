import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';


// Constants
const TWITTER_HANDLE = 'HussainMAuwal';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection';
const COLLECTION_NAME ='squarenft-f6jzmp13d5';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = '0x01845f3E8f5016f3Fb9127B8DE1f8a7a30aDaB04';

const App = () => {

  /*
  * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
  */
  const [currentAccount, setCurrentAccount] = useState("");

  const [isLoading, setLoading] = useState(false);
  const [nftsMinted, setNftsMinted] = useState('0');

  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    /*
    * Check if we're authorized to access the user's wallet
    */
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    /*
    * User can have multiple authorized accounts, we grab the first one if its there!
    */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)

      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener()
    } else {
      console.log("No authorized account found")
    }
  }

  
  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 

      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`Hey there! We've minted your NFT. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}>`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
  try {
    const { ethereum } = window;

    if (ethereum) {
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      } else{
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        /*
        * Call the TotalNftsMinted method from your Smart Contract
        */
        let nftsTxn = await connectedContract.totalNftsMinted();

        setLoading(true);

        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        setLoading(false);

        

        console.log(`Nfts Minted: ${nftsTxn}`);

        /*
         * Store our data in React State
         */
        setNftsMinted(nftsTxn.toString());
      }

    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error)
  }
}



  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick= { connectWallet } className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          {isLoading &&
            (<div className="loader"></div>)
          }
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          { currentAccount === "" ? renderNotConnectedContainer() : (
            /** Add askContractToMintNft Action for the onClick event **/
            <div>
              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                Mint NFT
              </button>
              <br/>
              <p className= "mint-count">
                {nftsMinted}/{TOTAL_MINT_COUNT} NFTs Minted
              </p>
              <button  className=" cta-button opensea-button"><a href= { `${OPENSEA_LINK}/${COLLECTION_NAME}`}>
                🌊 View Collection on OpenSea</a>
              </button>
          </div>
          )
          }
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;