import { Button, Form, Divider } from "semantic-ui-react";
import web3 from "web3";
import Approval from "./Approval";

export default function Deposit(props) {

  function calculateReceived() {
    let received;
    let vaultBalance = new web3.utils.BN(props.token.vaultBalance);
    let collateralAmount = new web3.utils.BN(props.token.collateralAmount);
    let obligatedFees = new web3.utils.BN(props.token.obligatedFees);
    let withheldProtocolFees = new web3.utils.BN(props.token.withheldProtocolFees);
    let totalSupply = new web3.utils.BN(props.token.totalSupply);

    let totalFeePercentage = ((props.token.depositFee) + (props.factory.depositFee))/100000;
    let reducedDeposit = props.depositAmt * (1 - totalFeePercentage);

    if(totalSupply.toString() === '0') {
      received = props.depositAmt;
    } else {
      received = reducedDeposit * Number(totalSupply.div(collateralAmount.add(vaultBalance).sub(obligatedFees).sub(withheldProtocolFees)));
    }

    if(isNaN(received) || received === '')
      return 0;

    return received;
  }

  let wBalance = parseFloat(
    props.token.assetObject.myBalance / `1e${props.token.assetObject.tDecimals}`
  ).toFixed(6);
  return (
    <div>
      {props.token.totalSupply >= 0 && (
        <Form>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: "30px",
              marginBottom: "30px",
              justifyContent: "left",
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
                width: "60%",
                marginLeft: "10%",
                marginRight: "10px",
              }}
              value={props.depositAmt}
              onChange={props.updateDAmt}
            />

            <div style={{ paddingTop: "13px" }}>
              {props.token.assetObject.tSymbol}
            </div>
          </div>
          {!props.showApproval ? (
            <div>
              <Button
              style={{
                width: "80%",
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
              }}
              onClick={() => {
                props.deposit(props.depositAmt);
              }}
              size="large"
              // labelPosition="left"
              disabled={
                Number(props.depositAmt) === 0 ||
                props.token.assetObject.myBalance === 0 ||
                props.btnDisabled
              }
            >
              Deposit
            </Button>
            <div
              style={{
                marginTop: "10px",
                marginBottom: "10px",
                fontSize: "13px",
                textAlign: "center"
              }}
            >
              If you deposit {props.depositAmt} {props.token.assetObject.tSymbol}, you will receive 
              {" " + calculateReceived()}  {props.token.tSymbol}
            </div>
          </div>
            
          ) : (
            <Approval
              token={props.token}
              web3={props.web3}
              approveAsset={props.approveAsset}
              depositAmt={props.depositAmt}
              acct={props.acct}
            ></Approval>
          )}
          <Divider />
          <div
            style={{
              marginTop: "25px",
              marginBottom: "25px",
              textAlign: "center",
              fontSize: "18px",
              fontFamily: "'Lato', sans-serif",
              marginLeft: "15px",
              marginRight: "15px",
            }}
          >
            {props.token.assetObject.tSymbol} Balance: {wBalance}
          </div>
          <Divider />
          <div
            style={{
              marginTop: "25px",
              marginBottom: "25px",
              textAlign: "center",
              fontSize: "18px",
              fontFamily: "'Lato', sans-serif",
              marginLeft: "15px",
              marginRight: "15px",
            }}
          >
            Deposit Fee: {props.token.depositFee === -1 ? <>0%</> : <>{props.token.depositFee/10000}%</>}
          </div>
          <Divider />
          <div
            style={{
              marginTop: "25px",
              textAlign: "center",
              fontSize: "12px",
              fontFamily: "'Gill Sans', sans-serif",
              marginLeft: "15px",
              marginRight: "15px",
            }}
          >
            {" "}
            When depositing, you will deposit {props.token.assetObject.tSymbol} in
            redemption for vault tokens to represent your fair share of the
            vault. Depositing is open anytime whether the withdrawal window is
            closed or not.
          </div>
        </Form>
      )}
    </div>
  );
}
