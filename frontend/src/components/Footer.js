import { Icon } from "semantic-ui-react";
import styled from "styled-components";

import "../App.css";

const FooterContainer = styled.div`
  text-align: center;
  padding-bottom: 10px;
  padding-top: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  // position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 200px;
  background-color: #1a5388;
`;
const SocialStyle = styled.div`
  transition: transform 0.5s;
  cursor: pointer;
  margin: 0px 28px;
  width: 50px;
  height: 50px;
  background-color: #55acee;
  border-radius: 30px;
  &.github {
    background-color: white;
  }
  &.discord {
    background-color: white;
  }
`;

const CopyRightText = styled.div`
  font-size: 14px;
  color: white;
  margin-top: 30px;
  margin-bottom: 100px;
`;
const SocialContainer = styled.div`
  justify-content: center;

  display: flex;
  flex-directton: row;
`;

export default function Footer() {
  return (
    <FooterContainer>
      <SocialContainer>
        <SocialStyle className="socialLink twitter">
          <a href="https://twitter.com/OptionalFinance">
            <i
              class="fab fa-twitter  fa-2x"
              style={{
                color: "white",

                paddingTop: "13px",
              }}
            />
          </a>
        </SocialStyle>
        <SocialStyle className="socialLink github">
          <a
            style={{ color: "purple" }}
            href="https://github.com/Alpha-Serpentis-Developments/Project-Mimic"
          >
            <Icon
              size="big"
              name="github"
              class="fab fa-twitter"
              style={{
                color: "black",

                paddingTop: "12px",
                paddingLeft: "4px",
              }}
            />
          </a>
        </SocialStyle>
        <SocialStyle className="socialLink discord">
          <a style={{ color: "purple" }} href="https://discord.gg/u9wMgBY">
            <Icon
              size="big"
              name="discord"
              style={{
                color: "#7289da",

                paddingTop: "12px",
                paddingLeft: "3px",
              }}
            />
          </a>
        </SocialStyle>
      </SocialContainer>

      <CopyRightText>
        Frontend Built and Tailored by{" "}
        <a href="https://github.com/littlefish-tech">Yvonne</a> for Optional
      </CopyRightText>
    </FooterContainer>
  );
}
