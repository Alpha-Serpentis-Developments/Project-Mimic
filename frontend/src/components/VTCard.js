import { useState } from "react";
import { Modal, Button, Icon } from "semantic-ui-react";
import VaultTokenInfo from "./VaultTokenInfo";
import styled from "styled-components";

const VTAddress = styled.span`
  margin-left: 20px;
  font-size: 10px;
  color: #333333;
`;
const VTCardContainer = styled.div`
  background-color: #af84e7;
  margin-bottom: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  width: 600px;
  border: 1px solid #d9d9d9;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  cursor: pointer;
  display: inline-block;
  margin-left: auto;
  margin-right: auto;

  &:hover {
    background-color: #8a02b2;
    color: white;
    .tAddr {
      color: white;
    }
  }
`;
const VTNameContainer = styled.div`
  margin: 10px 20px 0px 20px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
const VTName = styled.div`
  font-family: "Quantico", sans-serif;
  text-shadow: white 1px 0 3px;
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
  const [open, setOpen] = useState(false);
  const [clickedItem, setClickedItem] = useState();

  function showTokenInfo(e, i) {
    console.log(e);
    console.log(i);
    setClickedItem(i.value);
    setOpen(true);
  }

  function oneCard(item) {
    return (
      <VTCardContainer>
        <VTNameContainer>
          <VTName>{item.name()}</VTName>
          <VTAddress className="tAddr">{item.address}</VTAddress>
        </VTNameContainer>
        <VtContentcontainer>
          <LeftContent>
            <ManagedText>
              managed by <a href="https://twitter.com/AlphaSerpentis_">@Amethyst</a>
            </ManagedText>
            <PercentContent>
              <ItemInfo>
                <ItemTextHeader>Last Round</ItemTextHeader>
                <ItemText>+30%</ItemText>
              </ItemInfo>
              <ItemInfo>
                <ItemTextHeader>NAV</ItemTextHeader>
                <ItemText>$1000.00</ItemText>
              </ItemInfo>
            </PercentContent>
          </LeftContent>
          <RightContent>
            <Button
              onClick={showTokenInfo}
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
      <div>
        {" "}
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          closeIcon
          size="small"
        >
          {/* <Modal.Header>
          <ERCTokenInfo token={clickedItem} acct={props.acct} />
        </Modal.Header> */}
          <Modal.Content>
            <VaultTokenInfo
              token={clickedItem}
              acct={props.acct}
              mpAddress={props.mpAddress}
              ethBal={props.ethBal}
            />
          </Modal.Content>
        </Modal>
      </div>
    </div>
  );
}
