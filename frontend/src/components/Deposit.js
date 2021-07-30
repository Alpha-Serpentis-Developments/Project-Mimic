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

export default function Deposit(props) {
  return (
    <div>
      {props.token.totalSupply > 0 && !props.managerClick && (
        <Form>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: "30px",
              marginBottom: "50px",
              justifyContent: "center",
            }}
          >
            {/* <Popup
              pinned
              trigger={
                <Icon
                  name="info circle"
                  color="orange"
                  size="large"
                  style={{ marginTop: "auto", marginBottom: "auto" }}
                />
              }
            >
              <Popup.Header>Deposit</Popup.Header>
              <Popup.Content>
                When depositing, you will deposit the vault's asset token in
                redemption for vault tokens to represent your fair share of the
                vault. Depositing is open anytime whether the withdrawal window
                is closed or not.
              </Popup.Content>
            </Popup> */}

            <input
              style={{
                width: "70%",
                marginLeft: "10px",
                marginRight: "10px",
                backgroundColor: "#dedede",
              }}
              value={props.depositAmt}
              onChange={props.updateDAmt}
            />

            <div style={{ paddingTop: "13px" }}>
              {props.token.assetObject.tSymbol}
            </div>
          </div>

          <Button
            style={{
              width: "80%",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              backgroundColor: "#9de0ad",
            }}
            onClick={() => {
              props.deposit(props.depositAmt);
            }}
            size="large"
            // labelPosition="left"
            disabled={
              props.token.totalSupply === 0 ||
              props.token.assetObject.myBalance === 0 ||
              props.btnDisabled
            }
          >
            Deposit
          </Button>
          <div
            style={{
              marginTop: "10px",
              textAlign: "center",
              fontSize: "12px",
              fontFamily: "'Gill Sans', sans-serif",
              marginLeft: "15px",
              marginRight: "15px",
            }}
          >
            {" "}
            When depositing, you will deposit the vault's asset token in
            redemption for vault tokens to represent your fair share of the
            vault. Depositing is open anytime whether the withdrawal window is
            closed or not.
          </div>
        </Form>
      )}
    </div>
  );
}
