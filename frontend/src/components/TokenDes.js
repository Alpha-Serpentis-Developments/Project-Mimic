import styled from "styled-components";
import { Divider } from "semantic-ui-react";
import VaultTokenInfo from "./VaultTokenInfo";
import CoveredCallsList from "./CoveredCallsList";
import "../App.css";

const DesContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 3%;
  @media only screen and (max-width: 800px) {
    margin-right: 3%;
    flex-direction: column;
  }
`;

const LeftDes = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
  @media only screen and (max-width: 800px) {
    width: 90%;
    flex-direction: column;
  }
`;
const TokenName = styled.div`
  font-family: Roboto Slab;
  margin-top: 50px;
  margin-bottom: 20px;
  font-size: 40px;
  color: white;
  @media only screen and (max-width: 800px) {
    font-size: 35px;
  }
`;

const VaultDescript = styled.div`
  font-family: Roboto Slab;
  font-size: 16px;
  margin-top: 20px;
  margin-bottom: 20px;
  line-height: 2;
  color: white;
`;

const DWContainer = styled.div`
  margin-right: 3%;
  width: 35%;
  @media only screen and (max-width: 800px) {
    margin-left: 3%;
    width: 90%;
  }
`;

export default function TokenDes(props) {
  return (
    <div
      style={{
        backgroundColor: "#070036",
        backgroundImage: "linear-gradient(#8b1bef,#20759D)",
        minHeight: "100vh",
      }}
    >
      <DesContainer className="tokenDes">
        <LeftDes>
          <TokenName>{props.token.tName}</TokenName>
          <Divider />
          <VaultDescript>
            The Strategy consist of a weekly call-write on $WETH calls with
            strike selection being based on +20% spot at the moment.
          </VaultDescript>
          <CoveredCallsList
            sellCallList={props.sellCallList}
            token={props.token}
          />
        </LeftDes>
        <DWContainer>
          <VaultTokenInfo
            token={props.token}
            acct={props.acct}
            mpAddress={props.mpAddress}
            ethBal={props.ethBal}
            openIPFSModal={props.openIPFSModal}
          />
        </DWContainer>
      </DesContainer>
    </div>
  );
}
