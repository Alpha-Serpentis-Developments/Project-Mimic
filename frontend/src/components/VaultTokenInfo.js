import { useState } from "react";
import StatusMessage from "./StatusMessage";
import { nwConfig, currentChain } from "./NetworkConfig";

import {
  Header,
  Button,
  Grid,
  Divider,
  Icon,
  Segment,
  Form,
  Popup,
  Label,
  Accordion,
} from "semantic-ui-react";
import { web3 } from "./Web3Handler";
import WethWrap from "./WethWrap";
import Withdraw from "./Withdraw";
import Deposit from "./Deposit";
import styled from "styled-components";

const DWIndicator = styled.div`
  display: flex;
  flex-direction: row;
  width: 80%;
  height: 60px;

  margin-left: auto;
  margin-right: auto;
`;
const DIndicator = styled.div`
  padding-top: 17px;
  border-radius: 0px 20px 0 0;
  background-color: #9aa9ff63;
  width: 50%;
  text-align: center;
  cursor: pointer;
  border-top: 1px solid black;
  border-right: 1px solid black;
  font-size: 20px;
  font-weight: 700;
  &:hover {
    background-color: #663a82;
    color: white;
  }
`;
const WIndicator = styled.div`
  padding-top: 17px;
  cursor: pointer;
  border-radius: 20px 0px 0 0;
  background-color: #9aa9ff63;
  width: 50%;
  text-align: center;
  border-right: 1px solid black;
  border-top: 1px solid black;
  border-right: 1px solid black;
  border-left: 1px solid black;
  font-size: 20px;
  font-weight: 700;
  &:hover {
    background-color: #663a82;
    color: white;
  }
`;

// const InitializeBtn = styled.div`
//   padding-top: 17px;
//   cursor: pointer;
//   border-radius: 20px 20px 0 0;
//   background-color: #146ca4;
//   width: 50%;
//   text-align: center;
//   &:hover {
//     background-color: purple;
//   }
// `;

const InitializeForm = styled.div`
  width: 80%;
  margin-left: auto;
  margin-right: auto;
  border-radius: 20px 20px 20px 20px;
  background-color: #146ca4;
  padding-bottom: 50px;
`;

const DWForm = styled.div`
  width: 80%;
  margin-left: auto;
  margin-right: auto;
  border-radius: 0 0 20px 20px;
  border: 1px solid black;
  background-color: #9aa9ff63;
  padding-bottom: 50px;
`;

const ManagerTXBtns = styled.div`
  width: 80%;
  display: flex;
  flex-direction: row;
`;
const WriteBtn = styled.div`
  padding-top: 17px;
  cursor: pointer;
  border-radius: 20px 0px 0 0;
  background-color: #146ca4;
  width: 50%;
  text-align: center;
  &:hover {
    background-color: purple;
  }
`;
const SellCallBtn = styled.div`
  padding-top: 17px;
  cursor: pointer;
  border-radius: 0px 0px 0 0;
  background-color: #146ca4;
  width: 50%;
  text-align: center;
  &:hover {
    background-color: purple;
  }
`;
const SettleVaultBtn = styled.div`
  padding-top: 17px;
  cursor: pointer;
  border-radius: 0px 20px 0 0;
  background-color: #146ca4;
  width: 50%;
  text-align: center;
  &:hover {
    background-color: purple;
  }
`;
const ConfirmCancelBtns = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
`;
export default function VaultTokenInfo(props) {
  const [depositAmt, setDeposit] = useState(0);
  const [withdrawAmt, setWithdrawAmt] = useState(0);
  const [initializeAmt, setInitializeAmt] = useState(0);

  const [oTokenAddress, setOTokenaddress] = useState("");
  const [writeCallAmt, setWriteCallAmt] = useState(0);
  const [sellCallAmt, setSellCallAmt] = useState(0);
  const [premiumAmount, setPemiumAmount] = useState(0);
  const [otherPartyAddress, setOtherPartyAddress] = useState(0);
  const [showWriteCall, setShowWriteCall] = useState(false);
  const [showSellCall, setShowSellCall] = useState(false);
  const [writeColor, setWriteColor] = useState("teal");
  const [sellColor, setSellColor] = useState("teal");
  const [settleColor, setSettleColor] = useState("teal");

  const [statusMessage, setStatusMessage] = useState("");
  const [showStatus, setShowStatus] = useState(false);
  const [statusHeader, setStatusHeader] = useState("");
  const [statusError, setStatusError] = useState(false);
  const [txSent, setTxSent] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [iconStatus, setIconStatus] = useState("loading");
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [managerClick, setManagerClick] = useState(false);

  //=======texting for eth to weth
  const [eToWethAmt, setEToWethAmt] = useState(0);
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showD, setShowD] = useState(false);
  const [showW, setShowW] = useState(true);

  function ethInputAmt(event) {
    if (event.target.value > props.ethBal) {
      setSM("Error", "Not enough ether", true, true);
      setIconStatus("error");
      return;
    }
    setEToWethAmt(event.target.value);
  }

  function ethToWeth(a) {
    if (a === 0) {
      setSM("Error", "Form input Error", true, true);
      setIconStatus("error");
      return;
    }
    let amount = web3.utils.toWei(a, "ether");
    let e = web3.eth.sendTransaction({
      from: props.acct,
      to: nwConfig[currentChain].wethContractAddr,
      value: amount,
    });
    sendTX(e, "Converting to WETH");
  }

  //========ending
  function setSM(h, m, s, e) {
    setStatusHeader(h);
    setStatusMessage(m);
    setShowStatus(s);
    setStatusError(e);
  }

  function sendTX(c, label) {
    // eval[c]
    c
      // .on("receipt", function (receipt) {
      //   console.log(receipt);
      //   setSM("TX Receipt Received", "", true, false);
      // })
      .on("transactionHash", function (hash) {
        setTxHash(hash);
        setSM("TX Hash Received", hash, true, false);
      })
      .on("error", function (error, receipt) {
        let m = "";
        if (error !== null) {
          let i = error.message.indexOf(":");
          m = error.message.substring(0, i > 0 ? i : 40);
        }
        setSM(label + " TX Error", m, true, true);
        setTxSent(false);
        setIconStatus("error");
      })
      .on("confirmation", function (confirmationNumber, receipt) {
        setSM(
          label + " TX Confirmed",
          confirmationNumber + " Confirmation Received",
          true,
          false
        );
        setIconStatus("confirmed");
      });
  }

  function overAmount(a, b, c) {
    c = c * 1e18;
    if (a > b + c) {
      setSM("Error", "You don't have enough balance", true, true);
      setIconStatus("error");
      return;
    } else if (a > b && a < b + c) {
      setSM(
        "Error",
        `You need to convert ${(a - b) / 1e18} ETH to WETH`,
        true,
        true
      );
      setIconStatus("error");
      setShowConvertForm(true);
      return;
    }
  }

  function deposit(amt) {
    console.log(props);
    startTX();
    if (amt === 0 || isNaN(amt)) {
      setSM("Error", "Form input Error", true, true);
      setIconStatus("error");
      return;
    }
    // let amount = web3.utils.toWei(amt, dUnit);
    let amount = web3.utils.toWei(amt, "ether");
    props.token
      .approveAsset(amount, props.acct)
      .on("transactionHash", function (hash) {
        setTxHash(hash);
        setSM("TX Hash Received", hash, true, false);
      })
      .on("error", function (error, receipt) {
        let m = "";
        if (error !== null) {
          let i = error.message.indexOf(":");
          m = error.message.substring(0, i > 0 ? i : 40);
        }
        setSM("" + " TX Error", m, true, true);
        setTxSent(false);
        setIconStatus("error");
      })
      .on("confirmation", function (confirmationNumber, receipt) {
        if (confirmationNumber === 1) {
          let i = props.token.deposit(amount, props.acct);
          sendTX(i, "deposit");
          setSM("Approval TX Confirmed", "Confirmation Received", true, false);

          setIconStatus("confirmed");
        }
      });
  }

  function initialize(amt) {
    startTX();
    if (amt === 0 || isNaN(amt)) {
      setSM("Error", "Form input Error", true, true);
      setIconStatus("error");

      return;
    }
    let amount = web3.utils.toWei(amt, "ether");
    props.token
      .approveAsset(amount, props.acct)
      .on("transactionHash", function (hash) {
        setTxHash(hash);
        setSM("TX Hash Received", hash, true, false);
      })
      .on("error", function (error, receipt) {
        let m = "";
        if (error !== null) {
          let i = error.message.indexOf(":");
          m = error.message.substring(0, i > 0 ? i : 40);
        }
        setSM(" TX Error", m, true, true);
        setTxSent(false);
        setIconStatus("error");
      })
      .on("confirmation", function (confirmationNumber, receipt) {
        if (confirmationNumber === 1) {
          let i = props.token.initialize(amount, props.acct);
          sendTX(i, "initialize");
          setSM("Approval TX Confirmed", " Confirmation Received", true, false);

          setIconStatus("confirmed");
        }
      });
  }

  function withDraw(amt) {
    startTX();

    if (amt === 0 || isNaN(amt)) {
      setSM("Error", "Form input Error", true, true);
      setIconStatus("error");
      return;
    }

    // let amount = web3.utils.toWei(amt, wUnit);
    let amount = web3.utils.toWei(amt, "ether");
    let w = props.token.withdraw(amount, props.acct);
    sendTX(w, "Withdraw");
  }

  function settleVault() {
    startTX();
    let s = props.token.settleVault(props.acct);
    sendTX(s, "Settle Vault");
  }

  function writeCall(amt, oTAddress) {
    startTX();
    //  let amount = web3.utils.toWei(amt, writeCallUnit);
    let amount = web3.utils.toWei(amt, "ether");
    let wc = props.token.writeCalls(
      amount,
      oTAddress,
      props.mpAddress,
      props.acct
    );
    sendTX(wc, "Write Call");
  }

  function sellCall(amt, premiumAmount, otherPartyAddress) {
    //let amount = web3.utils.toWei(amt, sellCallUnit);
    let amount = parseInt(amt) * (1e8).toString();
    // let pAmount = web3.utils.toWei(premiumAmount, pemiumUnit);
    let pAmount = web3.utils.toWei(premiumAmount, "ether");
    let sc = props.token.sellCalls(
      amount,
      pAmount,
      otherPartyAddress,
      props.acct
    );
    sendTX(sc, "Sell Call");
  }

  function confirmWriteCall(e) {
    startTX();
    e.preventDefault();
    if (writeCallAmt === 0 || oTokenAddress === "") {
      setSM("Error", "Form input Error", true, true);
      setIconStatus("error");

      return;
    }

    writeCall(writeCallAmt, oTokenAddress);
  }

  function confirmSellCall(e) {
    startTX();
    e.preventDefault();
    if (sellCallAmt === 0 || premiumAmount === 0 || otherPartyAddress === "") {
      setSM("Error", "Form input Error", true, true);
      setIconStatus("error");

      return;
    }

    sellCall(sellCallAmt, premiumAmount, otherPartyAddress);
  }

  function startTX() {
    setBtnDisabled(true);
    setSM("MetaMask", "Sending Transaction", true, false);
    setTxSent(true);
  }

  // function disableAllInput() {}
  function resetForm() {
    setBtnDisabled(false);
    setIconStatus("loading");
    setShowStatus(false);
  }

  function handleConvert(e, titleProps) {
    const { index } = titleProps;
    const newIndex = activeIndex === index ? -1 : index;

    setActiveIndex(newIndex);
  }

  function convertForm() {
    return (
      <div style={{ textAlign: "center" }}>
        <Accordion>
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={handleConvert}
          >
            <Icon name="dropdown" />
            ETH <Icon name="long arrow alternate right" /> WETH Wrapper
          </Accordion.Title>
          {/* {showConvertModal && ( */}

          <Accordion.Content active={activeIndex === 0}>
            <p>
              <WethWrap
                acct={props.acct}
                ethInputAmt={ethInputAmt}
                ethToWeth={() => ethToWeth(eToWethAmt)}
                eToWethAmt={eToWethAmt}
              />
              {/* )} */}
            </p>
          </Accordion.Content>
        </Accordion>
      </div>
    );
  }

  function writeCallRender() {
    return (
      <DWForm>
        <Form>
          <Divider hidden />

          <Form.Group
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: "30px",
              marginBottom: "50px",
              justifyContent: "center",
            }}
          >
            <div style={{ marginTop: "10px" }}>Amount</div>
            <input
              style={{ width: " 60%", marginLeft: "15px", marginRight: "15px" }}
              value={writeCallAmt}
              // onChange={(e) => setWriteCallAmt(e.target.value)}
              onChange={(e) => {
                if (e.target.value > 0) {
                  let a = web3.utils.toWei(e.target.value, "ether");
                  overAmount(
                    a,
                    props.token.assetObject.myBalance,
                    props.ethBal
                  );
                  setWriteCallAmt(e.target.value);
                } else {
                  setWriteCallAmt(e.target.value);
                }
              }}
            />
            <div style={{ marginTop: "10px" }}>
              {props.token.assetObject.tSymbol}
            </div>
            {/* <label>select</label>
            <Menu compact size="tiny">
              <Dropdown
                defaultValue="ether"
                options={units}
                item
                onChange={updateWriteCallUnit}
              />
            </Menu> */}
          </Form.Group>

          <Form.Field
            style={{ width: "90%", marginRight: "auto", marginLeft: "auto" }}
          >
            <label>oToken Address</label>
            <input
              value={oTokenAddress}
              onChange={(e) => setOTokenaddress(e.target.value)}
            />
          </Form.Field>
          <Form.Field
            style={{ width: "90%", marginRight: "auto", marginLeft: "auto" }}
          >
            <label>Margin Pool Address</label>
            <input placeholder={props.mpAddress} value={props.mpAddress} />
          </Form.Field>
          <ConfirmCancelBtns>
            <Button
              style={{ width: "40%" }}
              color="teal"
              onClick={confirmWriteCall}
              disabled={btnDisabled}
            >
              Write Call
            </Button>
            <Button
              style={{ width: "40%" }}
              onClick={() => {
                setShowWriteCall(false);
                setSM("", "", false, false);
                setTxHash("");
                setTxSent(false);
                setSellColor("teal");
                setSettleColor("teal");
                setManagerClick(false);
              }}
              disabled={btnDisabled}
            >
              Cancel
            </Button>
          </ConfirmCancelBtns>
        </Form>
      </DWForm>
    );
  }

  // vault tokens / (asset tokens + collateral amount)
  //props.token.assetObject
  function showRatio() {
    // let vtBN = new BigNumber(props.token.totalSupply);
    // let atBN = new BigNumber(props.token.vaultBalance);

    // let denominator = atBN.plus(props.token.collateralAmount);

    // let pairRatio = parseInt(vtBN.dividedBy(denominator).toString());
    return (
      <Grid textAlign="center" stackable>
        <Grid.Column>
          <Header
            size="large"
            style={{
              padding: "3px 10px",
              border: "1px solid black",
              width: "80%",
              borderRadius: "5px",
              marginRight: "auto",
              marginLeft: "auto",
              fontFamily: "system-ui;",
              color: "white",
            }}
          >
            1 {props.token.assetObject.tSymbol} ={" "}
            {Number(props.token.totalSupply) /
              (Number(props.token.vaultBalance) +
                Number(props.token.collateralAmount))}{" "}
            Vault Tokens
            {/* {pairRatio} */}
          </Header>
          {/* <Header.Subheader># vault tokens/ vault assets</Header.Subheader> */}
          <Header.Subheader>
            Vault Tokens / (Asset Tokens + Collateral Amount)
          </Header.Subheader>
        </Grid.Column>
      </Grid>
    );
  }

  function showInitialize() {
    return (
      <div>
        {" "}
        <Divider />
        <Divider hidden />
        <InitializeForm>
          <Grid textAlign="center">
            <Form>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  marginLeft: "auto",
                  marginRight: "right",
                }}
              >
                {" "}
                <input
                  style={{ marginRight: "10px", marginTop: "20px" }}
                  value={initializeAmt}
                  // onChange={(e) => setInitializeAmt(e.target.value)}
                  onChange={(e) => {
                    if (e.target.value > 0) {
                      let a = web3.utils.toWei(e.target.value, "ether");
                      overAmount(
                        a,
                        props.token.assetObject.myBalance,
                        props.ethBal
                      );
                      setInitializeAmt(e.target.value);
                    } else {
                      setInitializeAmt(e.target.value);
                    }
                  }}
                />
                <div style={{ marginTop: "30px", marginRight: "20px" }}>
                  {props.token.assetObject.tSymbol}
                </div>
                {/* <Menu compact size="tiny">
                <Dropdown
                  // defaultValue="wei"
                  defaultValue="ether"
                  options={units}
                  item
                  onChange={updateIUnit}
                />
              </Menu> */}
              </div>
              <Button
                style={{ marginTop: "30px", width: "100%" }}
                onClick={() => initialize(initializeAmt)}
                color="teal"
                disabled={btnDisabled}
              >
                Initialize
              </Button>
            </Form>
          </Grid>
        </InitializeForm>
      </div>
    );
  }

  function renderSellCall() {
    return (
      <DWForm>
        <Form>
          <Divider hidden />
          <Form.Group
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {/* <label>Amount</label> */}
            <input
              style={{ width: "60%", marginRight: "10px" }}
              value={sellCallAmt}
              onChange={(e) => setSellCallAmt(e.target.value)}
            />

            <div style={{ marginTop: "10px" }}>oToken</div>
            {/* <Form.Field>
            <label>select</label>
            <Menu compact size="tiny">
              <Dropdown
                defaultValue="ether"
                options={units}
                item
                onChange={updateSellCallUnit}
              />
            </Menu>
          </Form.Field> */}
          </Form.Group>
          <Form.Group
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {/* <label>Premium Amount</label> */}
            <input
              style={{ width: "60%", marginRight: "10px" }}
              value={premiumAmount}
              // onChange={(e) => setPemiumAmount(e.target.value)}
              onChange={(e) => {
                if (e.target.value > 0) {
                  let a = web3.utils.toWei(e.target.value, "ether");
                  overAmount(
                    a,
                    props.token.assetObject.myBalance,
                    props.ethBal
                  );
                  setPemiumAmount(e.target.value);
                } else {
                  setPemiumAmount(e.target.value);
                }
              }}
            />

            <div style={{ marginTop: "10px" }}>
              {props.token.assetObject.tSymbol}
            </div>
            {/* <Form.Field>
            <label>select</label>
            <Menu compact size="tiny">
              <Dropdown
                defaultValue="ether"
                options={units}
                item
                onChange={updatePremiumUnit}
              />
            </Menu>
          </Form.Field> */}
          </Form.Group>
          <Form.Field
            style={{ width: "90%", marginRight: "auto", marginLeft: "auto" }}
          >
            <label>Other party address</label>
            <input
              placeholder="Other party address"
              onChange={(e) => setOtherPartyAddress(e.target.value)}
            />
          </Form.Field>
          <ConfirmCancelBtns>
            {" "}
            <Button
              style={{ width: "40%" }}
              color="teal"
              onClick={confirmSellCall}
              disabled={btnDisabled}
            >
              Sell Call
            </Button>
            <Button
              style={{ width: "40%" }}
              onClick={() => {
                setShowSellCall(false);
                setWriteColor("teal");
                setSettleColor("teal");
                setManagerClick(false);
              }}
              disabled={btnDisabled}
            >
              Cancel
            </Button>
          </ConfirmCancelBtns>
        </Form>
      </DWForm>
    );
  }

  function managerMenu() {
    return (
      <div>
        <Divider hidden />
        <DWIndicator>
          <WriteBtn
            labelPosition="right"
            color={writeColor}
            onClick={() => {
              setShowWriteCall(true);
              setWriteColor("teal");
              setShowSellCall(false);
              setSellColor("grey");
              setSettleColor("grey");
              setManagerClick(true);
            }}
            disabled={btnDisabled}
          >
            Write Call
          </WriteBtn>

          <SellCallBtn
            color={sellColor}
            labelPosition="right"
            onClick={() => {
              setShowSellCall(true);
              setShowWriteCall(false);
              setSellColor("teal");
              setWriteColor("grey");
              setSettleColor("grey");
              setManagerClick(true);
            }}
            disabled={btnDisabled}
          >
            Sell Call
          </SellCallBtn>

          <SettleVaultBtn
            color={settleColor}
            onClick={settleVault}
            disabled={btnDisabled}
          >
            Settle Vault
          </SettleVaultBtn>
        </DWIndicator>
        {showWriteCall && writeCallRender()}
        {showSellCall && renderSellCall()}
      </div>
    );
  }
  function updateWDAmt(e) {
    setWithdrawAmt(e.target.value);
  }

  function updateDAmt(e) {
    if (e.target.value > 0) {
      let a = web3.utils.toWei(e.target.value, "ether");
      overAmount(a, props.token.assetObject.myBalance, props.ethBal);
      setDeposit(e.target.value);
    } else {
      setDeposit(e.target.value);
    }
  }
  function clickShowD() {
    console.log("click d");
    setShowD(true);
    setShowW(false);
  }
  function clickShowW() {
    console.log("click w");
    setShowD(false);
    setShowW(true);
  }
  function showTokenPair() {
    return (
      <>
        <DWIndicator>
          <WIndicator onClick={() => clickShowW()}>Withdraw</WIndicator>
          <DIndicator onClick={() => clickShowD()}>Deposit</DIndicator>
        </DWIndicator>
        {!showD ? (
          <DWForm>
            <Withdraw
              token={props.token}
              withDraw={withDraw}
              withdrawAmt={withdrawAmt}
              updateWDAmt={updateWDAmt}
              managerClick={managerClick}
              btnDisabled={btnDisabled}
            />
          </DWForm>
        ) : (
          <DWForm>
            <Deposit
              token={props.token}
              deposit={deposit}
              depositAmt={depositAmt}
              updateDAmt={updateDAmt}
              managerClick={managerClick}
              btnDisabled={btnDisabled}
            />
          </DWForm>
        )}
      </>
    );
  }

  return (
    <div>
      {showStatus && (
        <Grid>
          <Grid.Column width={14}>
            <StatusMessage
              statusHeader={statusHeader}
              statusMessage={statusMessage}
              statusError={statusError}
              txHash={txHash}
              iconStatus={iconStatus}
            />
          </Grid.Column>
          <Grid.Column width={2} verticalAlign="middle">
            {iconStatus !== "loading" && (
              <Button onClick={resetForm} icon="check" circular />
            )}
          </Grid.Column>
        </Grid>
      )}
      {/* {showConvertForm && convertForm()} */}
      <Divider hidden />
      <Divider hidden />
      {props.token.totalSupply !== 0 && showTokenPair()}

      {props.token.totalSupply === 0 && showInitialize()}

      {props.token.manageToken && managerMenu()}
      <Divider hidden />
      {convertForm()}
    </div>
  );
}

// {props.token.vaultBalance > 0 && showRatio()}
