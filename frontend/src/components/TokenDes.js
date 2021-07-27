import React from "react";
import styled from "styled-components";
import { Table, Divider, Button, Grid } from "semantic-ui-react";

const DesContainer = styled.div`
  height: 800px;
`;
const TokenName = styled.div`
  font-size: 40px;
`;

const VaultDescript = styled.div`
  font-size: 16px;
`;

export default function TokenDes(props) {
  console.log(props);
  return (
    <DesContainer>
      <TokenName>{props.token.tName}</TokenName>
      <Divider />
      <VaultDescript>
        {" "}
        The Strategy consist of a weekly call-write on $WETH calls with strike
        selection being based on +20% spot at te moment
      </VaultDescript>
    </DesContainer>
  );
}
