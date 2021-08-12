import { Button, Header, Icon, Modal, Grid } from "semantic-ui-react";

export default function MMInstallModal(props) {
  return (
    <Modal
      basic
      onClose={props.closeMMInstallModal}
      open={props.showMMInstallModal}
      size="small"
    >
      <Header icon>
        <Icon name="attention" />
      </Header>
      <Modal.Content>
        <Grid textAlign="center">
          <p>A MetaMask installation is required</p>
        </Grid>
      </Modal.Content>
      <Modal.Actions>
        <Grid textAlign="center">
          <Button color="green" inverted onClick={props.closeMMInstallModal}>
            <Icon name="checkmark" /> OK
          </Button>
        </Grid>
      </Modal.Actions>
    </Modal>
  );
}
