export default function VaultTokenInfo1(props) {
  console.log("props.token.assetObject");
  console.log(props.token.assetObject);

  function deposit(amount, to) {
    props.token.deposit(50000000000, props.acct);
  }
  function ttt() {
    return (
      <div>
        {/* <Header>Asset Token: {props.token.asset}</Header>
        <Header>Manager: {props.token.manager}</Header> */}
        {/* {props.token.assetObject && (
          <ERCTokenInfo token={props.token.assetObject} />
        )} */}
        <Grid stackable columns={2}>
          <Grid.Column>
            <Item>
              <Item.Image
                size="tiny"
                src="https://react.semantic-ui.com/images/wireframe/image.png"
              />

              <Item.Content>
                <Item.Header as="a">Header</Item.Header>
                <Item.Meta>Description</Item.Meta>
                <Item.Description>
                  <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
                </Item.Description>
                <Item.Extra>Additional Details</Item.Extra>
              </Item.Content>
            </Item>

            <Header>
              <Label color="grey" size="small" attached="top left">
                vault{" "}
              </Label>
              <Header size="large">{props.token.name()}</Header>
            </Header>

            <Header size="medium">
              My Balance: {props.token.myBalance / 1e18}
            </Header>

            {/* <Header>{props.token.symbol()}</Header> */}

            <Header size="medium">
              Total Supply: {props.token.totalSupply / 1e18}
            </Header>
          </Grid.Column>

          <Grid.Column>
            <Header size="large" color="orange">
              Asset Token: {props.token.assetObject.name()}
            </Header>

            <Header size="medium">
              My Balance: {props.token.assetObject.myBalance / 1e18}
            </Header>

            <Header size="medium">
              Vault Balance: {props.token.vaultBalance / 1e18}
            </Header>
            {/* <Header>Total Supply: {props.token.assetObject.totalSupply}</Header> */}
          </Grid.Column>
          {/* <Header>{props.token.symbol()}</Header> */}
        </Grid>
        <Divider />
        <Grid>
          <Header size="large" color="violet">
            Ratio: {props.token.totalSupply / props.token.assetObject.myBalance}
          </Header>
        </Grid>
        <Divider />
        <Grid stackable columns={2}>
          <Grid.Column>
            <Button onClick={deposit} color="green" icon="plus">
              Deposit
            </Button>
          </Grid.Column>
          <Grid.Column>
            <Button onClick={deposit} color="red" icon="minus">
              Withdraw
            </Button>
          </Grid.Column>
        </Grid>

        {/* <Header>{props.token.symbol()}</Header> */}
      </div>
    );
  }
}
