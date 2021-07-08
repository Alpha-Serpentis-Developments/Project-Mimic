import React, { useState } from "react";
import { Button, Form, Input } from "semantic-ui-react";

export default function WethWrap(props) {
  return (
    <Form>
      <Form.Group>
        <Form.Field inline>
          {/* <div>{nwConfig[currentChain].wethContractAddr}</div> */}
          <label>ETH Amount</label>
          <Input placeholder="Amount" onChange={props.ethInputAmt} />
        </Form.Field>
        <Button onClick={props.ethToWeth}>Convert</Button>
      </Form.Group>
    </Form>
  );
}
