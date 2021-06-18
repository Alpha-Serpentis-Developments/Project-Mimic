import React from "react";
import { nwConfig, currentChain, setChain } from "./NetworkConfig";
import { Button, Header, Icon, Modal, Grid } from "semantic-ui-react";

export default function AppReload(props) {
  return (
    <Modal basic open={props.reload} size="small">
      <Header icon>
        <Icon name="spinner" loading size="large" />
      </Header>
      <Modal.Content>
        <Grid textAlign="center">
          <Header inverted>
            Changing Network to {nwConfig[currentChain].name}
          </Header>
        </Grid>
      </Modal.Content>
    </Modal>
  );
}
