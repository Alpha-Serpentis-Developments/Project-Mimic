import { Menu, Button, Header, Icon } from "semantic-ui-react";
import MMConnect from "./MMconnection";
import profileImg from "../images/cover.png";

export default function TopMenu(props) {
  return (
    <div
      className="topMenu"
      style={{
        backgroundColor: "#eddbf4",
      }}
    >
      <div>
        <Menu inverted secondary>
          <Menu.Item>
            <img
              src={profileImg}
              style={{
                objectFit: "cover",
                height: "40px",
                width: "40px",
                // marginLeft: "20px",
              }}
            />
          </Menu.Item>
          <Menu.Item
            name="home"
            position="right"
            // active={menuActive === "home"}
            active={props.renderHome}
            // onClick={clickMenu}
            onClick={props.clickHome}
          >
            <Header size="large" color={props.homeNav}>
              Home
            </Header>
          </Menu.Item>
          <Menu.Item
            name="trade"
            position="right"
            // active={menuActive === "trade"}
            active={props.renderFollow}
            // onClick={clickMenu}
            onClick={props.clickTrade}
          >
            <Header size="large" color={props.tradeNav}>
              Trade
            </Header>
          </Menu.Item>
          <Menu.Item
            name="manager"
            position="right"
            // active={menuActive === "manager"}
            active={props.renderManager}
            onClick={props.clickManager}
          >
            <Header size="large" color={props.managerNav}>
              Manager
            </Header>
          </Menu.Item>

          <Menu.Menu position="right">
            <Menu.Item>
              <Button color="grey" icon labelPosition="left">
                <Icon name="dot circle" color={props.mmColor} />{" "}
                <MMConnect
                  btnText={props.btnText}
                  acctNum={props.acctNum}
                  chainId={props.chainId}
                  ethBal={props.ethBal}
                  connectMM={props.connectMM}
                />
              </Button>
            </Menu.Item>
          </Menu.Menu>
        </Menu>
      </div>
    </div>
  );
}
