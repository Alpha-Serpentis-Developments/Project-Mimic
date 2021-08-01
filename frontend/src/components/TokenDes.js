import styled from "styled-components";
import { Divider } from "semantic-ui-react";
import VaultTokenInfo from "./VaultTokenInfo";
import CoveredCallsList from "./CoveredCallsList";

const DesContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 3%;
`;

const LeftDes = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
`;
const TokenName = styled.div`
  font-family: Roboto Slab;
  margin-top: 50px;
  margin-bottom: 20px;
  font-size: 40px;
`;

const VaultDescript = styled.div`
  font-family: Roboto Slab;
  font-size: 16px;
  margin-top: 20px;
  margin-bottom: 20px;
  line-height: 2;
`;

const DWContainer = styled.div`
  margin-right: 3%;
  width: 35%;
`;

export default function TokenDes(props) {
  return (
    <div
      style={{
        backgroundColor: "#070036",
        backgroundImage: "linear-gradient(#8b1bef,#20759D)",
      }}
    >
      <DesContainer>
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
          />
        </DWContainer>
      </DesContainer>
    </div>
  );
}
