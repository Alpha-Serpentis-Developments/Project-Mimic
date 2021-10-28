import { Button, Divider, Form } from "semantic-ui-react";

export default function Withdraw(props) {

  // console.log("info");
  // console.log(props.withdrawAmt);
  // console.log(props.btnDisabled);
  // console.log(props.token.expireTime);
  // console.log(props.token.expireTime < Date.now() / 1000);
  // console.log((props.token.expireTime !== -1 && props.token.expireTime < Date.now() / 1000));
  // console.log(props);
  return (
    <div>
      {props.token.totalSupply >= 0 && (
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
                  color="blue"
                  size="large"
                  style={{
                    marginTop: "auto",
                    marginBottom: "auto",
                  }}
                />
              }
            >
              <Popup.Header>Withdraw</Popup.Header>
              <Popup.Content>
                When withdrawing, you will burn away your vault tokens to redeem
                the underlying asset token. Withdrawing from the vault can only
                be done if the vault's withdrawal window has opened up after the
                manager has settled the vault.
              </Popup.Content>
            </Popup> */}

            <input
              style={{
                width: "60%",
                marginLeft: "10%",
                marginRight: "10px"
              }}
              value={props.withdrawAmt}
              onChange={props.updateWDAmt}
            />

            <div style={{ marginTop: "13px" }}> {props.token.tSymbol}</div>
          </div>
          <Button
            style={{
              width: "80%",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
            onClick={() => props.withDraw(props.withdrawAmt)}
            color={(props.token.expireTime !== -1 && props.token.expireTime < Date.now() / 1000) ? "blue" : "red"}
            size="large"
            disabled={
              (props.withdrawAmt === 0 ||
              props.btnDisabled ||
              (props.token.expireTime !== -1 && props.token.expireTime < Date.now() / 1000)) &&
              (props.token.oTokenAddr !== "")
            }
          >
            Withdraw
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
            Vault Balance: {props.token.myBalance/1e18 + " " + props.token.tSymbol} 
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
            Withdrawal Fee: {props.token.withdrawalFee === -1 ? <>0%</> : <>{props.token.withdrawalFee/10000}%</>}
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
            When withdrawing, you will burn away your vault tokens to redeem the
            underlying asset token. Withdrawing from the vault can only be done
            if the vault's withdrawal window has opened up after the manager has
            settled the vault.
          </div>
        </Form>
      )}
    </div>
  );
}
