import React from "react";
import VTCard from "../components/VTCard";
import { Table, Divider, Button, Grid } from "semantic-ui-react";

export default function Trade(props) {
  return (
    <Table
      textAlign="center"
      celled={true}
      style={{
        borderStyle: "none",
        backgroundColor: "#070036",
        backgroundImage: "linear-gradient(#8b1bef,#20759D)",
        minHeight: "100vh",
      }}
    >
      <Table.Body>
        <Table.Row verticalAlign="top">
          <Table.Cell>
            <h1 style={{ fontSize: "40px", color: "white" }}>Portfolio</h1>
            <VTCard
              tList={props.pList}
              update={props.update}
              title="Portfolio"
              acct={props.acctNum}
              showSpinner={props.vtList.length === 0}
              ethBal={props.ethBal}
              showTokenInfo={props.showTokenInfo}
            />

            <div>
              <Divider hidden style={{ marginTop: "0px" }} />

              <Divider hidden style={{ marginBottom: "0px" }} />
            </div>
          </Table.Cell>
          <Table.Cell>
            <h1
              style={{
                fontSize: "40px",
                color: "white",
              }}
            >
              Available Vaults
            </h1>
            <VTCard
              tList={props.fList}
              update={props.update}
              title="Follow List"
              acct={props.acct}
              showSpinner={props.vtList.length === 0}
              ethBal={props.ethBal}
              showTokenInfo={props.showTokenInfo}
            />
            {/* <TokenList
                  tList={followList}
                  update={update}
                  title="Follow List"
                  acct={props.acctNum}
                  showSpinner={vtList.length === 0}
                  ethBal={props.ethBal}
                /> */}
            <div>
              <Divider hidden style={{ marginTop: "0px" }} />
              <Divider hidden />

              <Divider hidden style={{ marginBottom: "0px" }} />
            </div>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
}
