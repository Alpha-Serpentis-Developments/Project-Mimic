import React from "react";

// import "../style/mmConnect.css";

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
    <div>
      <div onClick={props.connectMM}>
        <p>{props.btnText}</p>
      </div>
    </div>
  );
}
