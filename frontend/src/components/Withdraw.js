import { Button, Icon, Form, Popup } from "semantic-ui-react";

export default function Withdraw(props) {
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
            <Popup
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
            </Popup>

            <input
              style={{
                width: "70%",
                marginLeft: "10px",
                marginRight: "10px",
                backgroundColor: "grey",
              }}
              value={props.withdrawAmt}
              onChange={props.updateWDAmt}
            />

            <div style={{ marginTop: "13px" }}> {props.token.tSymbol}</div>
            {/* <Menu compact size="tiny">
                  <Dropdown
                    defaultValue="ether"
                    options={units}
                    item
                    onChange={updatewUnit}
                  />
                </Menu> */}
          </div>
          <Button
            style={{
              width: "80%",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
            onClick={() => props.withDraw(props.withdrawAmt)}
            color="blue"
            size="large"
            disabled={props.btnDisabled}
          >
            Withdraw
          </Button>
        </Form>
      )}
    </div>
  );
}