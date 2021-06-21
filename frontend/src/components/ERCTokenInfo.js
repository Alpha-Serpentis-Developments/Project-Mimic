import React from "react";
import { Header, Grid } from "semantic-ui-react";

export default function ERCTokenInfo(props) {
  return (
    <div>
      <Header size="medium" color="purple">
        {props.token.name()}
      </Header>
      <Grid stackable columns={2}>
        <Grid.Column>
          <Header size="medium">My Balance: {props.token.myBalance}</Header>
        </Grid.Column>
        <Grid.Column>
          <Header size="medium">Total Supply: {props.token.totalSupply}</Header>
        </Grid.Column>
        {/* <Header>{props.token.symbol()}</Header> */}
      </Grid>
    </div>
  );
}
