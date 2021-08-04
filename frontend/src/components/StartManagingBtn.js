import "../App.css";
import styled from "styled-components";

const TXBtn = styled.button`
  vertical-align: middle;
  width: 280px;
  height: 50px;
  margin-bottom: 20px;
  font-size: 25px;
  margin-right: 20px;
  @media (max-width: 700px) {
    margin-right: auto;
    margin-left: auto;
  }
`;
export default function StartManagingBtn(props) {
  return (
    <TXBtn className="StartButtons" onClick={props.clickManager}>
      <span>Start Managing</span>
    </TXBtn>
  );
}
