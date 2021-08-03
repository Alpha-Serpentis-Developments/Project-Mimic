import styled from "styled-components";
import { currentChain, nwConfig } from "./NetworkConfig";

const CoveredCallDetail = styled.div`
  font-family: Roboto Slab;
  border: 2px solid #0286c3;
  padding: 10px 15px;
  border-radius: 8px;
`;

const SectionTitle = styled.div`
  margin-top: 20px;
  font-size: 30px;
  margin-bottom: 30px;
`;

const HRLine = styled.div`
  height: 2px;
  background-color: #0286c3;
  border-radius: 30px;
`;

const IndividualSC = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  cursor: pointer;
`;
const SCLink = styled.a`
  text-decoration: none;
  color: black;
  :hover& {
    color: black;
  }
`;
const OTokenName = styled.div`
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const NoCoverCall = styled.div`
  font-size: 25px;
  font-weight: 700;
  margin-top: 30px;
  margin-bottom: 30px;
  color: #e6696e;
`;
export default function CoveredCallsList(props) {
  console.log(props);
  function makeEtherscanLink(h) {
    return nwConfig[currentChain].prefix + "tx/" + h;
  }
  function OneSellCall(el) {
    let premiumAmt, oTokenAmt, estYield;

    premiumAmt =
      el.returnValues.premiumReceived / 10 ** Number(props.token.tDecimals);
    oTokenAmt = el.returnValues.amountSold / 1e8;
    estYield = (premiumAmt / oTokenAmt) * 100;
    estYield = estYield.toFixed(3);

    return (
      <div>
        <div>+ {premiumAmt} WETH</div>
        <div>{oTokenAmt} oTokens Sold</div>
        <div>Est. Yield: {estYield}%</div>
      </div>
    );
  }

  return (
    <CoveredCallDetail>
      <SectionTitle>Traded Covered Calls</SectionTitle>
      <HRLine />
      {props.sellCallList.length > 0 ? (
        <div>
          {props.sellCallList.map((t, i) => {
            // console.log(t);
            // OneSellCall(t);
            // let l = `https://etherscan.io/tx/${props.sellCallList[i].transactionHash}`;
            return (
              <IndividualSC>
                <SCLink
                  href={makeEtherscanLink(
                    props.sellCallList[i].transactionHash
                  )}
                  target="_blank"
                >
                  <OTokenName>{props.token.oTokenNames[i]}</OTokenName>
                  <div>{OneSellCall(t)}</div>
                </SCLink>
              </IndividualSC>
            );
          })}
        </div>
      ) : (
        <NoCoverCall>NO DATA AVAILABLE TO SHOW</NoCoverCall>
      )}
    </CoveredCallDetail>
  );
}
