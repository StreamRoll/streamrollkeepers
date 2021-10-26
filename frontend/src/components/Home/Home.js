import React, { useState, useEffect } from "react";
import Logo from "../Logo/Logo";
import Connect from "../Connect/Connect";
import Text from "../Text/Text";
import Cards from "../Cards/Cards";
import css from "./Home.css";

const { ethers } = require("ethers");

const abi = [
  "function supplyEthToCompound() public payable returns (bool)",
  "function getEtherBack(uint256 _amount) public returns (bool)",
  "function getBalance(address _requested) public view returns (uint)",
  "function getCheckout(address _requested) external view returns (uint)",
  "function transferBack(uint _amount, address payable _to) public returns (bool)",
];
const contractAddress = "0x067B64684C00E545623062De131eE2330ab891BB"; //This is a deployed contract.. Change it to yours if you want.
const metaMaskProvider = new ethers.providers.Web3Provider(
  window.ethereum,
  "rinkeby"
);
const contract = new ethers.Contract(contractAddress, abi, metaMaskProvider);
const gasPriceHex = ethers.utils.hexlify(20000000000);
const gasLimitHex = ethers.utils.hexlify(150000);

const Home = () => {
  const [supplyAmount, setSupplyAmount] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [collateralBalance, setCollateralBalance] = useState(
    "Connect your wallet"
  );
  const [checkoutBalance, setCheckoutBalance] = useState("Connect your wallet");
  const [retrieveAmount, setRetrieveAmount] = useState("");

  useEffect(async () => {
    try {
      const signer = metaMaskProvider.getSigner();
      const signerContract = contract.connect(signer);
      const userAddr = await signer.getAddress();
      console.log("Before");
      const bal = await signerContract.getBalance(userAddr, {
        gasLimit: gasLimitHex,
        gasPrice: gasPriceHex,
      });
      const checkout = await signerContract.getCheckout(userAddr, {
        gasLimit: gasLimitHex,
        gasPrice: gasPriceHex,
      });
      setCollateralBalance(
        ethers.utils.formatEther(bal.toString()) + " " + "ETH"
      );
      setCheckoutBalance(
        ethers.utils.formatEther(checkout.toString()) + " " + "ETH"
      );
      setUserAddress(userAddr);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const connectAccount = async () => {
    await window.ethereum.enable();
    await metaMaskProvider.send("eth_requestAccounts");
    const signer = metaMaskProvider.getSigner();
    const signerContract = contract.connect(signer);
    const userAddr = await signer.getAddress();
    setUserAddress(userAddr);
    alert("You are connected");
  };

  const supplyEth = async () => {
    if (supplyAmount <= 0) {
      alert("You need to supply more than 0 ETH");
      return;
    }
    if (isNaN(supplyAmount) === true) {
      alert("You need to type numbers");
      return;
    }
    const signer = metaMaskProvider.getSigner();
    const signerContract = contract.connect(signer);
    signerContract
      .supplyEthToCompound({
        value: ethers.utils.parseEther(supplyAmount.toString()),
      })
      .then((res) => console.log(res))
      .catch((error) => alert(error));
  };

  const retrieveEth = async () => {
    if (retrieveAmount <= 0) {
      alert("0 or negative amounts are invalid");
      return;
    }
    if (isNaN(retrieveAmount) === true) {
      alert("You need to type numbers");
      return;
    }
    const signer = metaMaskProvider.getSigner();
    const signerContract = contract.connect(signer);
    await signerContract
      .getEtherBack(ethers.utils.parseEther(retrieveAmount.toString()))
      .then((res) => console.log(res))
      .catch((error) => alert(error));
  };

  const _transfer = async () => {
    const signer = metaMaskProvider.getSigner();
    const signerContract = contract.connect(signer);
    if (
      (await signerContract.getCheckout(await signer.getAddress()),
      {
        gasLimit: gasLimitHex,
        gasPrice: gasPriceHex,
      }) <= 0
    ) {
      alert("Insufficient checkout funds");
      return;
    }
    const address = await signer.getAddress();
    const amount = await signerContract.getCheckout(await signer.getAddress());
    const result = await signerContract.transferBack(amount, address);
  };

  return (
    <div className="Home">
      <Logo />
      <Connect onClick={() => connectAccount()} userAddress={userAddress} />
      <div className="Text">
        <Text />
      </div>
      <Cards
        title1="Collateral Balance"
        text1={collateralBalance}
        placeholder1="Supply ETH"
        onChange1={(e) => setSupplyAmount(e.target.value)}
        button1="Supply"
        onClick1={() => supplyEth()}
        title2="DAI Balance"
        text2="0 ETH"
        placeholder2="input amount"
        onChange2={(e) => console.log(e.target.value)}
        button2="send"
        title3="Checkout Balance"
        text3={checkoutBalance}
        placeholder3="Retrieve ETH"
        onChange3={(e) => setRetrieveAmount(e.target.value)}
        button3="Retrieve"
        onClick3={() => retrieveEth()}
        sendEth={() => _transfer()}
      />
    </div>
  );
};
export default Home;
