import styled from "styled-components";

export default function CoveredCallsList(props) {
  console.log(props);
  function OneSellCall(el) {
    return (
      <div>
        {/* <div>{props.token.oTokenObj.tName}</div> */}
        <div>{el.returnValues.amountSold}</div>
        <div>{el.returnValues.premiumReceived}</div>
        <div>{el.returnValues.premiumReceived}</div>
      </div>
    );
  }

  return props.sellCallList.map((t) => {
    // console.log(t);
    // OneSellCall(t);
    return OneSellCall(t);
  });
}
