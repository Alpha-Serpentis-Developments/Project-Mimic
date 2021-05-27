import React, { useState } from "react";
import MMConnect from "./components/MMconnection";
import VaultContract from "./components/VaultContract";
import SSTrader from "./components/SSTrader";
import Follower from "./components/Follower";
import "./app.css";

// this is the temporary vault contract

export interface VaultContract {
  writeCalls: (a: number) => void;
  sellCalls: (b: number) => void;
  settleVault: (c: number) => void;
  deposit: (d: number) => void;
  withdraw: (e: number) => void;
}

export default function App() {
  let ttSupply: string = JSON.parse(
    localStorage.getItem("totalSupply") || "{}"
  );
  console.log(ttSupply);
  let ttSupplyNum = parseInt(ttSupply);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [showDeposit, setShowDeposit] = useState<boolean>(false);

  const [dAmt, setDAmt] = useState<number>(0);
  const [wAmt, setWAmt] = useState<number>(0);
  const [tempPlaceHolder, setTempPlaceHolder] = useState<VaultContract>();
  const [validateDInput, setValidateDInput] = useState<boolean>(false);
  const [validateWInput, setValidateWInput] = useState<boolean>(false);

  const [vaultToken, setVaultToken] = useState<number>(15);
  const [eBal, setEBal] = useState<number>(5);

  function onClickSupply(e: any) {
    setTotalSupply(totalSupply + 1);
    localStorage.setItem("totalSupply", JSON.stringify(totalSupply));
    setShowDeposit(true);
  }

  function clickReduceSupply() {
    setTotalSupply(totalSupply - 1);
    if (totalSupply === 0) {
      setTotalSupply(0);
      setShowDeposit(false);
    }
  }

  function onClickD(event: any) {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidateDInput(true);
    setTotalSupply(totalSupply + dAmt);
    setVaultToken(vaultToken + dAmt);
    setEBal(eBal - dAmt);

    tempPlaceHolder?.deposit(dAmt);
  }
  function onClickW(event: any) {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidateWInput(true);
    setTotalSupply(totalSupply - wAmt);
    setVaultToken(vaultToken - wAmt);
    setEBal(eBal + wAmt);
    tempPlaceHolder?.deposit(dAmt);
    tempPlaceHolder?.withdraw(wAmt);
  }
  function handleChangeD(e: any) {
    setDAmt(
      e.target.type === "number" ? parseInt(e.target.value) : e.target.value
    );
    if (e.target.value < 0) {
      setValidateDInput(true);
    }
  }

  function handleChangeW(e: any) {
    setWAmt(
      e.target.type === "number" ? parseInt(e.target.value) : e.target.value
    );
    if (e.target.value < 0) {
      setValidateWInput(true);
    }
  }

  return (
    <div>
      <MMConnect />
      <div className="content">
        <div>
          <VaultContract />
        </div>
        <div>
          <SSTrader totalSupply={totalSupply} />
          {showDeposit && (
            <div>
              Total Supply:{" "}
              <span className="totalSupp" onClick={clickReduceSupply}>
                {totalSupply}
              </span>
            </div>
          )}
          {!showDeposit && (
            <div className="initialize" onClick={onClickSupply}>
              Initialize
            </div>
          )}
        </div>
        <div>
          {" "}
          <Follower
            totalSupply={totalSupply}
            showDeposit={showDeposit}
            onClickD={onClickD}
            onClickW={onClickW}
            handleChangeD={handleChangeD}
            handleChangeW={handleChangeW}
            validateDInput={validateDInput}
            validateWInput={validateWInput}
            dAmt={dAmt}
            wAmt={wAmt}
            vaultToken={vaultToken}
            eBal={eBal}
          />
        </div>
      </div>
    </div>
  );
}
