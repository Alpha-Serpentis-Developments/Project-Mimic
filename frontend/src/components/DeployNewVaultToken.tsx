import { useState } from "react";
import { web3 } from "./Web3Handler";
import { nwConfig, currentChain } from "./NetworkConfig";
import {
  Button,
  Form,
  Header,
  Input,
  Modal,
  Grid,
  Divider,
} from "semantic-ui-react";

import { Factory } from "./Factory";
import { ERC20 } from "./Erc20";

import StatusMessage from "./StatusMessage";

// the kovan controller addr
//  const controllerAddr = "0xdee7d0f8ccc0f7ac7e45af454e5e7ec1552e8e4e";

// the ropsten controller addr
// const controllerAddr = "0x7A6828eF4AB3Cb9c08c40D0a05ad2416C8335C5c";

export interface tObj {
  address: string;
  returnValues: {
    vaultToken: string;
  };
}

let nc: any = nwConfig;

export default function DeployNewVaultToken(props: {
  openPlusModal: boolean;
  onClose: any;
  acctNum: string;
}) {
  let managerAddr: string = JSON.parse(localStorage.getItem("account") || "{}");
  // let controllerAddr = nc[currentChain].controllerAddress;

  // let assetTokenAddrs = nc[currentChain].aTokenAddrs;

  const [tokenName, setTokenName] = useState<string>("");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [assetTokenAddr, setAssetTokenAddr] = useState<string>("");
  const [maxAmt, setMaxAmt] = useState<string>("1");

  const [statusMessage, setStatusMessage] = useState<string>("");
  const [showStatus, setShowStatus] = useState<boolean>(false);
  const [statusHeader, setStatusHeader] = useState<string>("");
  const [statusError, setStatusError] = useState<boolean>(false);
  const [txSent, setTxSent] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [iconStatus, setIconStatus] = useState("loading");
  const [hour, setHour] = useState(0);
  const [miniute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const [winExpirLen, setWinExpirLen] = useState(0);

  let factory = new Factory(web3);

  function setSM(h: any, m: any, s: any, e: any) {
    setStatusHeader(h);
    setStatusMessage(m);
    setShowStatus(s);
    setStatusError(e);
  }

  function startTX() {
    setBtnDisabled(true);
    setSM("MetaMask", "Sending Transaction", true, false);
    setTxSent(true);
  }

  function sendTX(c: any, label: any) {
    c.on("transactionHash", function (hash: any) {
      setTxHash(hash);
      setSM("TX Hash Received", hash, true, false);
    })
      .on("error", function (error: any, receipt: any) {
        let m = "";
        if (error !== null) {
          let i = error.message.indexOf(":");
          m = error.message.substring(0, i > 0 ? i : 40);
        }
        setSM(label + " TX Error", m, true, true);
        setIconStatus("error");
      })
      .on("confirmation", function (confirmationNumber: any, receipt: any) {
        setSM(
          label + " TX Confirmed",
          confirmationNumber + " Confirmation Received",
          true,
          false
        );
        setIconStatus("confirmed");
      });
  }
  async function handleClick(e: any) {
    let atDecimal = await getATDecimal(assetTokenAddr);
    startTX();
    e.preventDefault();
    if (tokenName === "" || tokenSymbol === "" || assetTokenAddr === "") {
      setSM("Error", "Form Input Error", true, true);
      setIconStatus("error");
      return;
    }

    let amount = (10 ** atDecimal * parseFloat(maxAmt)).toString();
    console.log(amount);
    console.log(atDecimal);
    let c = factory.deployNewVT(
      tokenName,
      tokenSymbol,
      // controllerAddr,
      // //"0x0000000000000000000000000000000000000000",
      assetTokenAddr,
      winExpirLen,
      amount,
      props.acctNum
    );
    sendTX(c, "Deploy New Vault");
  }

  function resetSM() {
    setSM("", "", false, false);
  }
  function closeNewTokenModal() {
    resetForm();
    setTxSent(false);
    setTxHash("");
    resetSM();
    setTokenName("");
    setTokenSymbol("");
    props.onClose();
  }

  function resetForm() {
    setBtnDisabled(false);
    setIconStatus("loading");
    setShowStatus(false);
  }

  async function getATDecimal(atAddr: string) {
    let at = new ERC20(web3, atAddr);
    return await at.getDecimals();
  }

  return (
    <div>
      <Modal
        open={props.openPlusModal}
        onClose={closeNewTokenModal}
        closeIcon
        size="small"
      >
        <Modal.Content
          style={{
            height: "600px",
            backgroundColor: "#3b3d42",
          }}
        >
          <Form>
            <Form.Field
              control={Input}
              label="Vault Name"
              placeholder="Vault Name"
              value={tokenName}
              onChange={(e: any) => setTokenName(e.target.value)}
              required
            />

            <Form.Field
              control={Input}
              label="Vault Symbol"
              placeholder="Vault Symbbol"
              value={tokenSymbol}
              onChange={(e: any) => setTokenSymbol(e.target.value)}
              required
            />
            <Form.Field
              control={Input}
              label="Maximum Amount"
              placeholder="1"
              value={maxAmt}
              onChange={(e: any) => setMaxAmt(e.target.value)}
              required
            />
            <Form.Field
              control={Input}
              label="Manager Address"
              placeholder="Manager Address"
              value={managerAddr}
              // onChange={(e: any) => setManagerAddr(e.target.value)}
              required
            />
            <Header size="small">Withdrawal Window Length</Header>
            <Form.Group>
              <Form.Field
                control={Input}
                label="Hour"
                placeholder="Hour"
                focus
                // value={hour}
                onChange={async (e: any) => {
                  setHour(parseInt(e.target.value));
                  let totalLen = (parseInt(e.target.value) * 3600 +
                    miniute * 60 +
                    second);
                  setWinExpirLen(totalLen);
                }}
              />
              <Form.Field
                control={Input}
                label="Minute"
                placeholder="Minute"
                focus
                // value={hour}
                onChange={async (e: any) => {
                  setMinute(parseInt(e.target.value));
                  let totalLen = (hour * 3600 +
                    parseInt(e.target.value) * 60 +
                    second);
                  setWinExpirLen(totalLen)
                }}
              />
              <Form.Field
                control={Input}
                label="Second"
                placeholder="Second"
                focus
                // value={second}
                onChange={async (e: any) => {
                  setSecond(parseInt(e.target.value));
                  let totalLen = (hour * 3600 +
                    miniute * 60 +
                    parseInt(e.target.value));
                  setWinExpirLen(totalLen);
                }}
              />
            </Form.Group>

            <Divider hidden />
            {/* <Form.Field> */}
            {/* <Header size="tiny">
                Asset Token Address (USDC, WETH, WBTC, etc.)
              </Header> */}
            <Form.Field
              control={Input}
              label="Asset Token Address (USDC, WETH, WBTC, etc.)"
              placeholder="Asset Token Address"
              focus
              // value={second}
              onChange={(e: any) => {
                setAssetTokenAddr(e.target.value);
              }}
              required
            />
            {/* <Dropdown
                onChange={(e: React.SyntheticEvent<HTMLElement>, data: any) =>
                  setAssetTokenAddr(data.value)
                }
                // allowAdditions
                options={assetTokenAddrs}
                placeholder="Asset Token Address"
                selection
                clearable
                value={assetTokenAddr}
                widths="2"
              /> */}
            {/* </Form.Field> */}
            {/* {showErrorMessage && <ErrorMessage />} */}

            {showStatus && txSent && (
              <Grid>
                <Grid.Column width={16}>
                  <StatusMessage
                    statusHeader={statusHeader}
                    statusMessage={statusMessage}
                    statusError={statusError}
                    txHash={txHash}
                    iconStatus={iconStatus}
                    resetForm={resetForm}
                  />
                </Grid.Column>
                {/* <Grid.Column width={2} verticalAlign="middle">
                  {iconStatus !== "loading" && (
                    <Button
                      onClick={resetForm}
                      icon="check"
                      circular
                      color="teal"
                    />
                  )}
                </Grid.Column> */}
              </Grid>
            )}
            {/* {showSuccessMessage && <SuccessMessage />} */}
            <Divider hidden />
            <Form.Field
              control={Button}
              onClick={handleClick}
              icon="plus circle"
              content={"Deploy Token on " + nc[currentChain].name}
              labelPosition="right"
              //   color={nc[currentChain].color}
              disabled={btnDisabled}
            />
          </Form>
        </Modal.Content>
      </Modal>
    </div>
  );
}
