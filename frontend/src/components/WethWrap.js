import { Button, Divider, Form, Input } from "semantic-ui-react";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 80%;
  margin-left: auto;
  margin-right: auto;
  border-radius: 20px 20px 20px 20px;
  border: 1px solid black;
  background-color: #9aa9ff63;
  padding-bottom: 50px;
`;

export default function WethWrap(props) {
  return (
    <Wrapper>
      {" "}
      <Form>
        <Form.Field inline style={{ marginTop: "30px" }}>
          {/* <div>{nwConfig[currentChain].wethContractAddr}</div> */}
          <label>ETH Amount</label>
          <Input placeholder="Amount" onChange={props.ethInputAmt} />
        </Form.Field>
        <Button
          onClick={props.ethToWeth}
          style={{ width: "80%", marginTop: "30px" }}
        >
          Convert
        </Button>
        <Divider hidden />
        <div>ETH Balance: {props.ethBal}</div>
      </Form>
    </Wrapper>
  );
}
