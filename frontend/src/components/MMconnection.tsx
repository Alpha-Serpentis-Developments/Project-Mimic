import React, { useState, useEffect } from "react";
import NoMMModal from "./NoMMModal";
import Web3 from "web3";

import "../style/mmConnect.css";

let web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

export default function MMconnect() {
  let addr: string = JSON.parse(localStorage.getItem("account") || "{}");
  console.log(addr);
  if (addr) {
    const fFive = addr.slice(0, 10);
    const lFive = addr.slice(-8);
    addr = `${fFive}...${lFive}`;
  }
  const [hasMM, setHasMM] = useState<boolean>(false);
  const [btnText, setBtnText] = useState<string>("Connect MetaMask");
  const [acctNum, setAcctNum] = useState<string>(addr);
  const [chainId, setChainId] = useState<number>();
  const [ethBal, setEthBal] = useState<number>();
  const [openModal, setOpenModal] = useState<boolean>(false);

  // check if the meta mask is installed when the page load
  useEffect(() => {
    if (acctNum) {
      setBtnText(addr);
    }
    hasMMInstall();
  }, []);

  // check if meta mask is installed
  async function hasMMInstall() {
    if (web3 !== null) {
      await setHasMM(true);
      console.log(hasMM);

      return;
    }
  }
  // if metamask is install, connect the metamask
  // if not installed, show modal=> this part of the function not working currently
  async function connectMM(e: any) {
    if (!hasMM) {
      console.log("at here");
      setOpenModal(true);

      alert("You must install MetaMask first");
    } else {
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      const account: string = accounts[0];
      const fFive = account.slice(0, 10);
      const lFive = account.slice(-8);
      const wAddress = `${fFive}...${lFive}`;
      setAcctNum(account);
      setBtnText(wAddress);
      const chain_Id = await web3.eth.getChainId();
      const weiBal = await web3.eth.getBalance(account);
      const ethBal = parseInt(weiBal) / 1000000000000000000;
      console.log(ethBal);
      setChainId(chain_Id);
      setEthBal(ethBal);
      localStorage.setItem("account", JSON.stringify(account));
    }
  }

  function closeModal() {
    setOpenModal(false);
  }

  return (
    <div>
      <div className="mmbtn" onClick={connectMM}>
        <p>{btnText}</p>
      </div>
      {openModal && <NoMMModal onClick={closeModal} />}
    </div>
  );
}
