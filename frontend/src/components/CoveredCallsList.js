import styled from "styled-components";
import { currentChain, nwConfig } from "./NetworkConfig";

const CoveredCallDetail = styled.div`
  font-family: Roboto Slab;
  border: 2px solid #0286c3;
  padding: 10px 15px;
  border-radius: 8px;
  color: white;
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
  color: white;
  :hover& {
    color: white;
  }
`;
const OTokenName = styled.div`
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 10px;
  color: white;
  // :hover& {
  //   color: black;
  // }
`;

const NoCoverCall = styled.div`
  font-size: 25px;
  font-weight: 700;
  margin-top: 30px;
  margin-bottom: 30px;
  color: #e6696e;
`;

const NAVTSContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  margin-bottom: 15px;
`;

const NAV = styled.div`
  margin-left: 20%;
`;
const TS = styled.div``;
export default function CoveredCallsList(props) {
  let ts = props.token.expireTime;

  function makeEtherscanLink(h) {
    return nwConfig[currentChain].prefix + "tx/" + h;
  }
  function OneSellCall(el) {
    let premiumAmt, oTokenAmt, estYield, estYieldAnnualized;

    premiumAmt =
      el.returnValues.premiumReceived / 10 ** Number(props.token.tDecimals);
    oTokenAmt = el.returnValues.amountSold / 1e8;
    estYield = (premiumAmt / oTokenAmt) * 100;
    estYield = estYield.toFixed(3);
    estYieldAnnualized = (((estYield/100 + 1)**52 - 1) * 100);
    estYieldAnnualized = estYieldAnnualized.toFixed(3);

    return (
      <div>
        <div>+ {premiumAmt} WETH</div>
        <div>{oTokenAmt} oTokens Sold</div>
        <div>Est. Yield: {estYield}%</div>
        <div>Annualized: {estYieldAnnualized}%</div>
      </div>
    );
  }

  return (
    <CoveredCallDetail>
      <SectionTitle>Traded Covered Calls</SectionTitle>
      <NAVTSContainer>
        {ts > (Date.now()/1000) ? <TS>Vault is OPENED</TS> : <TS>Vault is CLOSED</TS>}
        <NAV>{props.token.nav}</NAV>
      </NAVTSContainer>
      <HRLine />
      {props.sellCallList.length > 0 ? (
        <div>
          {props.sellCallList.map((t, i) => {
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
