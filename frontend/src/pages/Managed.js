import React from "react";
import VTCard from "../components/VTCard";
import { Table, Divider, Button, Grid } from "semantic-ui-react";

export default function Managed(props) {
  return (
    <Table
      textAlign="center"
      celled={true}
      style={{
        borderStyle: "none",
        backgroundColor: "#070036",
        backgroundImage: "linear-gradient(#8b1bef,#35e9ea5c)",
      }}
    >
      <Table.Body>
        <Table.Row verticalAlign="top">
          <Table.Cell>
            <h1 style={{ fontSize: "40px", color: "white" }}>Managing</h1>
            <VTCard
              tList={props.mList}
              update={props.update}
              title="Managed Token"
              acct={props.acct}
              mpAddress={props.mpAddress}
              showSpinner={props.vtList.length === 0}
              ethBal={props.ethBal}
            />

            <Grid centered padded>
              <Grid.Row />
              <Button
                icon="plus circle"
                size="huge"
                color="purple"
                onClick={props.openModal}
                disabled={!props.acct}
              >
                New Token
              </Button>
              <Grid.Row />
              <Grid.Row />
              <Grid.Row />
            </Grid>

            <div>
              <Divider hidden style={{ marginTop: "0px" }} />

              <Divider hidden style={{ marginBottom: "0px" }} />
            </div>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
}
