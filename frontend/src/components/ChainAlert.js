import React from "react";
import { Header, Icon, Modal, Grid } from "semantic-ui-react";

export default function ChainAlert(props) {
  return (
    <Modal basic open={props.showChainAlert} size="small">
      <Header icon>
        <Icon name="attention" />
      </Header>
      <Modal.Content>
        <Grid textAlign="center">
          <p>We only supprt Mainnet and Kovan</p>
        </Grid>
      </Modal.Content>
    </Modal>
  );
}
