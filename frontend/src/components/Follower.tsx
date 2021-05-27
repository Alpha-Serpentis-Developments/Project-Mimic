import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import { VaultContract } from "../App";
import Web3 from "web3";

let web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

export default function Follower(props: {
  totalSupply: number;
  showDeposit: boolean;
  onClickD: any;
  onClickW: any;
  handleChangeD: any;
  handleChangeW: any;
  validateDInput: boolean;
  validateWInput: boolean;
  dAmt: number;
  wAmt: number;
  vaultToken: number;
  eBal: number;
}) {
  // const [dAmt, setDAmt] = useState<number>(1);
  // const [wAmt, setWAmt] = useState<number>(1);
  // const [tempPlaceHolder, setTempPlaceHolder] = useState<VaultContract>();
  // const [validateDInput, setValidateDInput] = useState<boolean>(false);
  // const [validateWInput, setValidateWInput] = useState<boolean>(false);

  const [hasMM, setHasMM] = useState<boolean>(false);
  const [btnText, setBtnText] = useState<string>("Connect MetaMask");
  const [btnDisable, setBtnDisable] = useState<boolean>(false);
  const [acctNum, setAcctNum] = useState<string>("");
  const [chainId, setChainId] = useState<number>(0);
  const [ethBal, setEthBal] = useState<number>(0);

  // check if the meta mask is installed when the page load
  useEffect(() => {
    hasMMInstall();
  }, []);

  // check if meta mask is installed
  async function hasMMInstall() {
    if (web3 !== null) {
      await setHasMM(true);
      console.log(hasMM);
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      const account: string = accounts[0];
      const fFive = account.slice(0, 10);
      const lFive = account.slice(-8);
      const wAddress = `${fFive}...${lFive}`;
      setBtnDisable(true);
      setAcctNum(account);
      setBtnText(wAddress);
      console.log(web3.eth);
      const chain_Id = await web3.eth.getChainId();
      const weiBal = await web3.eth.getBalance(account);
      const ethBal = parseInt(weiBal) / 1000000000000000000;
      console.log(ethBal);
      setChainId(chain_Id);
      setEthBal(ethBal);
      return;
    }
  }

  // function onClickD(event: any) {
  //   const form = event.currentTarget;
  //   if (form.checkValidity() === false) {
  //     event.preventDefault();
  //     event.stopPropagation();
  //   }

  //   setValidateDInput(true);
  //   tempPlaceHolder?.deposit(dAmt);
  // }
  // function onClickW(event: any) {
  //   const form = event.currentTarget;
  //   if (form.checkValidity() === false) {
  //     event.preventDefault();
  //     event.stopPropagation();
  //   }

  //   setValidateWInput(true);
  //   tempPlaceHolder?.deposit(dAmt);
  //   tempPlaceHolder?.withdraw(wAmt);
  // }
  // function handleChangeD(e: any) {
  //   setDAmt(e.target.value);
  //   console.log(ethBal - e.target.value);
  //   if (e.target.value < 0 || e.target.value > ethBal) {
  //     setValidateDInput(true);
  //   }
  // }

  // function handleChangeW(event: any) {
  //   setDAmt(event.target.value);
  //   if (event.target.value < 0) {
  //     setValidateWInput(true);
  //   }
  // }

  return (
    <div>
      <div>Followers</div>
      <div>
        {props.showDeposit && (
          <Form
            noValidate
            validated={props.validateDInput}
            onSubmit={props.onClickD}
          >
            <Form.Row>
              <Form.Group controlId="validationCustom04">
                <Form.Label>Deposit</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Amt, in eth"
                  onChange={props.handleChangeD}
                  min="0"
                  // value={props.wAmt}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid value
                </Form.Control.Feedback>
              </Form.Group>
            </Form.Row>
            <Button
              type="submit"
              disabled={props.dAmt < 0 || props.eBal - props.dAmt < 0}
            >
              Submit
            </Button>
          </Form>
        )}
        <Form
          noValidate
          validated={props.validateWInput}
          onSubmit={props.onClickW}
        >
          <Form.Row>
            <Form.Group controlId="validationCustom05">
              <Form.Label>Withdaw</Form.Label>
              <Form.Control
                type="number"
                placeholder="Amt,in Vault Token"
                onChange={props.handleChangeW}
                min="0"
                required
                // value={props.wAmt}
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid value
              </Form.Control.Feedback>
            </Form.Group>
          </Form.Row>
          <Button
            type="submit"
            disabled={
              props.wAmt < 0 ||
              props.totalSupply - props.wAmt < 0 ||
              props.vaultToken - props.wAmt < 0
            }
          >
            Submit
          </Button>
        </Form>
      </div>
      <Card style={{ width: "18rem" }}>
        <Card.Header>Account Detail</Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item>Chain ID: {chainId}</ListGroup.Item>
          <ListGroup.Item>Eth: {props.eBal}</ListGroup.Item>
          <ListGroup.Item>Vault Token: {props.vaultToken}</ListGroup.Item>
        </ListGroup>
      </Card>
    </div>
  );
}
