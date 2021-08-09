// import "../style/mmConnect.css";
import styled from "styled-components";

const MMBox = styled.div`
  @media (max-width: 700px) {
    font-size: 12px;
    margin-left: -60px;
  }
`;

export default function MMconnect(props: {
  btnText: string;
  acctNum: string;
  chainId: number | undefined;
  ethBal: number | undefined;
  connectMM: any;
}) {
  // check if the meta mask is installed when the page load

  // if metamask is install, connect the metamask
  // if not installed, show modal=> this part of the function not working currently

  return (
    <MMBox>
      <div onClick={props.connectMM}>
        <p style={{ lineHeight: "0px" }}>{props.btnText}</p>
      </div>
    </MMBox>
  );
}
