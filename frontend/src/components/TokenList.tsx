import React, { useState } from "react";
import { Header, Modal, Button, Icon, Table, Divider } from "semantic-ui-react";
import ERCTokenInfo from "./ERCTokenInfo";
import VaultTokenInfo from "./VaultTokenInfo";

export default function TokenList(props: {
  tList: Object[];
  update: number;
  title: string;
  acct: string;
  mpAddress: string;
  showSpinner: boolean;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [clickedItem, setClickedItem] = useState<Object | null>();

  function showTokenInfo(e: any, i: any) {
    setClickedItem(i.value);
    setOpen(true);
  }

  function renderTime(ts: number) {
    var s = new Date(ts).toLocaleDateString("en-US");
    // console.log(s)
    // // expected output "8/30/2017"

    var t = new Date(ts).toLocaleTimeString("en-US");
    // console.log(s)
    // // expected output "3:19:27 PM"
    return s + "  " + t;
  }

  function timeLeft(ts: number) {
    let n = ts - Date.now();
    let t = new Date(n);
    let h = t.getHours();
    let m = t.getMinutes();
    let s = t.getSeconds();
    return h + ":" + m + ":" + s;
  }

  function onetoken(item: any) {
    return (
      <>
        {" "}
        {/* <Table padded columns={3} striped> */}
        <Table.Cell collapsing verticalAlign="middle">
          <Button
            onClick={showTokenInfo}
            value={item}
            icon="edit"
            color="blue"
            disabled={!item.status}
          />
        </Table.Cell>
        <Table.Cell verticalAlign="middle">
          <Header>{item.name()}</Header>
        </Table.Cell>
        <Table.Cell verticalAlign="middle">
          <Header size="small" color="grey">
            {item.address}
          </Header>
        </Table.Cell>
        {item.expireTime !== -1 && item.expireTime > Date.now() / 1000 && (
          <>
            <Table.Cell verticalAlign="middle">
              <Icon name="clock outline" size="large" color="teal" />
            </Table.Cell>
            <Table.Cell verticalAlign="middle">
              <Header size="small">
                Vault will close in {timeLeft(item.expireTime * 1000)} hours
              </Header>
            </Table.Cell>
          </>
        )}
        {item.expireTime !== -1 && item.expireTime < Date.now() / 1000 && (
          <>
            <Table.Cell verticalAlign="middle">
              <Icon name="lock" size="large" color="red" />
            </Table.Cell>
            <Table.Cell verticalAlign="middle">
              <Header size="small">
                Vault closed at {renderTime(item.expireTime * 1000)}
              </Header>
            </Table.Cell>
          </>
        )}
        {/* </Table> */}
      </>
    );
  }

  return (
    <div>
      <div>
        <Header size="large">{props.title}</Header>
        {props.showSpinner && <Icon name="spinner" loading size="large" />}
        <Table striped>
          <Table.Body>
            {props.tList.map((item: any, i) => {
              return (
                <Table.Row
                  key={i}
                  verticalAlign="top"
                  // disabled={!item.status}

                  value={item}
                  size="large"
                >
                  {onetoken(item)}
                  {/* <Table.Cell value={item}>{onetoken(item)}</Table.Cell> */}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} closeIcon size="small">
        {/* <Modal.Header>
          <ERCTokenInfo token={clickedItem} acct={props.acct} />
        </Modal.Header> */}
        <Modal.Content>
          <VaultTokenInfo
            token={clickedItem}
            acct={props.acct}
            mpAddress={props.mpAddress}
          />
        </Modal.Content>
      </Modal>
    </div>
  );
}
