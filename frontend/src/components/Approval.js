import { Button } from "semantic-ui-react";

export default function Approval(props) {
    let sanitizedValue = parseFloat(
        props.depositAmt * `1e${props.token.assetObject.tDecimals}`
    ).toString();
    return (
        <div
            style={{
            fontSize: "20px",
            display: "flex",
            flexDirection: "row",
            marginTop: "30px",
            marginBottom: "40px",
            justifyContent: "center",
          }}
        >
            <Button
                onClick={() => {
                    props.approveAsset(sanitizedValue, props.acct)
                }}
            >
                Approve {props.depositAmt} {props.token.assetObject.tSymbol}
            </Button>
            <Button
                onClick={() => {
                    props.approveAsset(new props.web3.utils.BN(2).pow(new props.web3.utils.BN(256)).sub(new props.web3.utils.BN(1)), props.acct);
                }}
            >
                Infinite Approval
            </Button>
        </div>
        
    );
}