import { useState, useEffect } from "react";
import { web3 } from "./Web3Handler";
import { ERC20 } from "./Erc20";
import { Modal, Button, Icon } from "semantic-ui-react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Link } from "react-router-dom";
import VaultTokenInfo from "./VaultTokenInfo";
import { VaultToken } from "./VaultToken";
import TokenDes from "./TokenDes";
import styled from "styled-components";

const VTAddress = styled.span`
  margin-left: 20px;
  font-size: 10px;
  color: white;
`;
const VTCardContainer = styled.div`
  // background-color: #af84e7;
  margin-bottom: 30px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  width: 600px;
  border: 2px solid #000000;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  display: inline-block;
  margin-left: auto;
  margin-right: auto;
  color: white;

  // &:hover {
  //   background-color: #8a02b2;
  //   color: white;
  //   box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 white;
  //   .tAddr {
  //     color: white;
  //   }
  // }
`;
const VTNameContainer = styled.div`
  margin: 10px 20px 0px 20px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
const VTName = styled.div`
  // font-family: "Quantico", sans-serif;
  // text-shadow: white 1px 0 3px;
  font-size: 20px;
  font-weight: 800;
`;

const ManagedText = styled.div`
  margin-top: 5px;
  font-size: 15px;
  margin-bottom: 20px;
`;
const VtContentcontainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 0;
`;
const RightContent = styled.div`
  display: flex;
  flex-direction: column;
`;
const PercentContent = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 20px;
`;
// last round/price detailed info
const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 20px;
`;
const ItemText = styled.div`
  font-size: 15px;
  margin-bottom: 15px;
`;
const ItemTextHeader = styled.div`
  font-size: 15px;
  margin-bottom: 15px;
  font-weight: 600;
`;
// const TXBtn = styled.div`
//   width: 150px;
//   height: 40px;
//   background-color: #5e2df3;
//   margin: 10px 20px 10px 0px;
//   border-radius: 10px;
//   color: white;
//   font-weight: 700;
//   padding: 10px;
//   cursor: pointer;
//   &:hover {
//     opacity: 0.33;
//   }
// `;

export default function VTCard(props) {
  // const [open, setOpen] = useState(false);
  // const [clickedItem, setClickedItem] = useState();

  // function showTokenInfo(e, i) {
  //   setClickedItem(i.value);
  // }

  function oneCard(item) {
    let path = `/vault/${item.address}`;
    return (
      <VTCardContainer>
        <VTNameContainer>
          <VTName>{item.name()}</VTName>
          <VTAddress className="tAddr">{item.address}</VTAddress>
        </VTNameContainer>
        <VtContentcontainer>
          <LeftContent>
            <ManagedText>
              managed by{" "}
              <a href="https://twitter.com/AlphaSerpentis_">@Amethyst</a>
            </ManagedText>
            <PercentContent>
              <ItemInfo>
                <ItemTextHeader>Last Round</ItemTextHeader>
                <ItemText>(TBA)</ItemText>
              </ItemInfo>
              <ItemInfo>
                <ItemTextHeader>NAV</ItemTextHeader>
                <ItemText>
                  {item.nav === -1 ? <div>Calculating...</div> : item.nav}
                </ItemText>
              </ItemInfo>
            </PercentContent>
          </LeftContent>
          <RightContent>
            <Link to={path}>
              <Button
                onClick={props.showTokenInfo}
                value={item}
                disabled={!item.status}
                style={{
                  marginRight: "20px",
                  marginTop: "30px",
                  borderRadius: "30px",
                  padding: "10px 30px",
                  backgroundColor: "#7950EE",
                }}
              >
                Trade
              </Button>
            </Link>
          </RightContent>
        </VtContentcontainer>
      </VTCardContainer>
    );
  }

  return (
    <div>
      {props.showSpinner && (
        <Icon name="spinner" loading size="large" inverted />
      )}
      <div>
        {props.tList.map((item, i) => {
          return (
            <div>
              {oneCard(item)}
              {/* <Table.Cell value={item}>{onetoken(item)}</Table.Cell> */}
            </div>
          );
        })}
      </div>

      {/* <div>
        {" "}
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          closeIcon
          size="small"
        >
          <Modal.Content>
            <VaultTokenInfo
              token={clickedItem}
              acct={props.acct}
              mpAddress={props.mpAddress}
              ethBal={props.ethBal}
            />
          </Modal.Content>
        </Modal>
      </div> */}
    </div>
  );
}
