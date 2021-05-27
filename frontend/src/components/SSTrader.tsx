import React, { useState } from "react";
import Contract from "web3-eth-contract";
import { VaultContract } from "../App";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import "../style/trade.css";

// set provider for all later instances to use

export default function SSTrader(props: { totalSupply: number }) {
  const [dAmt, setDAmt] = useState<number>(1);
  const [wAmt, setWAmt] = useState<number>(1);
  const [tempPlaceHolder, setTempPlaceHolder] = useState<VaultContract>();
  const [validateInput, setValidateInput] = useState<boolean>(false);

  function onClickD(event: any) {
    const form = event.currentTarget;
    if (form.checkValidity() === false || dAmt < 0 || wAmt < 0) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidateInput(true);
    tempPlaceHolder?.deposit(dAmt);
  }
  function onClickW(event: any) {
    const form = event.currentTarget;
    if (form.checkValidity() === false || dAmt < 0 || wAmt < 0) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidateInput(true);
    tempPlaceHolder?.deposit(dAmt);
    tempPlaceHolder?.withdraw(wAmt);
  }
  function handleChangeD(e: any) {
    setDAmt(e.target.value);
    if (e.target.value < 0) {
      setValidateInput(true);
    }
  }

  return (
    <div>
      <div>Social Trader</div>

      <Form noValidate validated={validateInput} onSubmit={onClickW}>
        <Form.Row>
          <Form.Group controlId="validationCustom03">
            <Form.Label>Sell Calls</Form.Label>
            <Form.Control type="number" placeholder="Amount" required />
            <Form.Control.Feedback type="invalid">
              Please provide number bigger than 0
            </Form.Control.Feedback>
          </Form.Group>
        </Form.Row>
        <Button type="submit">Submit</Button>
      </Form>
      <Form noValidate validated={validateInput} onSubmit={onClickW}>
        <Form.Row>
          <Form.Group controlId="validationCustom04">
            <Form.Label>write calls</Form.Label>
            <Form.Control type="number" placeholder="Amount" required />
            <Form.Control.Feedback type="invalid">
              Please provide number bigger than 0
            </Form.Control.Feedback>
          </Form.Group>
        </Form.Row>
        <Button type="submit">Submit</Button>
      </Form>
      <Form noValidate validated={validateInput} onSubmit={onClickW}>
        <Form.Row>
          <Form.Group controlId="validationCustom05">
            <Form.Label>Settle Vault</Form.Label>
            <Form.Control type="number" placeholder="Amount" required />
            <Form.Control.Feedback type="invalid">
              Please provide number bigger than 0
            </Form.Control.Feedback>
          </Form.Group>
        </Form.Row>

        <Button type="submit">Submit</Button>
      </Form>
    </div>
  );
}
