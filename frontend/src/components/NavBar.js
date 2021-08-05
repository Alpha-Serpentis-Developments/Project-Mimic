import { useState } from "react";
import MMConnect from "./MMconnection";
import { Link } from "react-router-dom";

import optionalProfile from "../images/optionalProfile.png";
import styled from "styled-components";
import { Button, Icon, Modal } from "semantic-ui-react";
import "../App.css";

const MainNav = styled.nav`
  height: 68px;
  background-color: #8b1bef;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  @media (max-width: 700px) {
    display: none;
  }
`;
const NavLeft = styled.div`
  // display: flex;
  // flex-direction: row;
  // justify-content: flex-start;
`;
const NavRight = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
`;
const TitleLogo = styled.img`
  width: 21.08px;
  margin-left: 53.67px;
  margin-bottom: 8px;
`;
const TitleImg = styled.img`
  width: 150px;
`;

const NavLinkGroup = styled.ul`
  display: flex;
  align-items: center;
  flex-direction: row;
  list-style-type: none;
  width: 500px;
  justify-content: space-evenly;
`;

export default function NavBar(props) {
  const [showAlertMsg, setShowAlertMsg] = useState(true);

  const NavLink = styled.li`
    font-family: Roboto Slab;
    font-style: normal;
    font-weight: bold;
    font-size: 20px;
    line-height: 26px;
    letter-spacing: -0.02em;
    text-decoration: none;
    color: white;

    padding: 5px 10px;
    cursor: pointer;

    &.navHomeLink {
      border-bottom: ${props.homeNav} 4px solid;
    }
    &.navTradeLink {
      border-bottom: ${props.tradeNav} 4px solid;
    }
    &.navMgrLink {
      border-bottom: ${props.managerNav} 4px solid;
    }
    &:hover {
      border-bottom: #9489ffba 4px solid;
    }
  `;

  return (
    <MainNav>
      <NavLeft>
        <Link to="/">
          {/* <TitleLogo src={cover} /> */}
          <TitleImg src={optionalProfile} onClick={props.clickHome} />
        </Link>
      </NavLeft>

      <NavRight>
        <NavLinkGroup>
          {" "}
          <Link to="/">
            <NavLink className="navHomeLink" onClick={() => props.clickHome()}>
              Home
            </NavLink>
          </Link>
          <Link to="/trade">
            <NavLink
              className="navTradeLink"
              onClick={() => props.clickTrade()}
            >
              Trade
            </NavLink>
          </Link>
          <Link to="/managed">
            <NavLink
              className="navMgrLink"
              onClick={() => props.clickManager()}
            >
              Manager
            </NavLink>
          </Link>
        </NavLinkGroup>

        <Button
          //   color="grey"
          icon
          labelPosition="left"
          style={{
            height: "36px",
            marginTop: "auto",
            marginBottom: "auto",
            backgroundColor: "#8b1bef",
            color: "white",
            border: "2px solid white",
            borderRadius: "10px",
            marginRight: "10px",
            borderStyle: "groove",
            // boxShadow: "5px 5px 5px black",
          }}
        >
          <Icon
            name="dot circle"
            color={props.mmColor}
            style={{ backgroundColor: "#8b1bef" }}
          />{" "}
          <MMConnect
            btnText={props.btnText}
            acctNum={props.acctNum}
            chainId={props.chainId}
            ethBal={props.ethBal}
            connectMM={props.connectMM}
          />
        </Button>
      </NavRight>
      {props.visited && (props.renderPortfolio || props.renderManager) && (
        <Modal
          centered={false}
          open={showAlertMsg}
          onClose={() => setShowAlertMsg(false)}
          onOpen={() => setShowAlertMsg(true)}
        >
          <Modal.Header>NOTICE</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <b>
                Optional is an experimental product and may bear significant
                risks which are not limited to:
              </b>
              <br></br>
              <br></br>- Smart Contract Risks with Optional
              <br></br>- Smart Contract Risks with Opyn
              <br></br>- Volatility in the options market
              <br></br>- Social Tokens getting exercised
              <br></br>- Social Traders that act against their followers
              <br></br>
              <br></br>
              Optional nor Alpha Serpentis Developments does not endorse any of
              the vaults listed in the site. These are purely for informational
              purposes, are not an endorsement of investment, and users must
              perform their own due-diligence.
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button
              onClick={() => {
                props.clickToVisit();
                setShowAlertMsg(false);
              }}
            >
              OK
            </Button>
          </Modal.Actions>
        </Modal>
      )}
    </MainNav>
  );
}
