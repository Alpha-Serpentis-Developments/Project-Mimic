import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Table, Divider, Button, Grid } from "semantic-ui-react";
import VaultTokenInfo from "./VaultTokenInfo";
import { web3 } from "./Web3Handler";
import { VaultToken } from "./VaultToken";
import { ERC20 } from "./Erc20";

const DesContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 800px;
`;

const LeftDes = styled.div`
  width: 60%;
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
`;
const TokenName = styled.div`
  margin-top: 30px;
  font-size: 40px;
`;

const VaultDescript = styled.div`
  font-size: 16px;
`;

const DWContainer = styled.div`
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
            {" "}
            The Strategy consist of a weekly call-write on $WETH calls with
            strike selection being based on +20% spot at te moment
          </VaultDescript>
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
