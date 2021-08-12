import { Button, Form, Divider } from "semantic-ui-react";

export default function Deposit(props) {
  let wBalance = parseFloat(
    props.token.assetObject.myBalance / `1e${props.token.assetObject.tDecimals}`
  ).toFixed(6);
  return (
    <div>
      {props.token.totalSupply > 0 && !props.managerClick && (
        <Form>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: "30px",
              marginBottom: "40px",
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
              props.depositAmt === 0 ||
              props.token.totalSupply === 0 ||
              props.token.assetObject.myBalance === 0 ||
              props.btnDisabled
            }
          >
            Deposit
          </Button>
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
            WETH Balance: {wBalance}
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
