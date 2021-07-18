import React from "react";
import deposit from "../images/deposit.png";
import StartTXBtn from "./StartTXBtn";
import gamma from "../images/gamma.png";
import styled from "styled-components";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const LandingContainer = styled.div`
  background-color: #0b0050;
`;
const LandingText = styled.div`
  font-family: Roboto Slab;
  font-style: normal;
  font-weight: bold;
  font-size: 48px;
  line-height: 63px;
  text-align: center;
  padding-top: 41px;
  color: white;
`;
const DepositImg = styled.img`
  width: 588px;
  height: 36px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top: 32px;
  margin-bottom: 93px;
`;
const AboutTitle = styled.div`
  margin-top: 56px;
  font-family: Roboto Slab;
  font-style: normal;
  font-weight: bold;
  font-size: 40px;
  line-height: 53px;
  text-align: center;
  color: white;
`;

const AboutContainer = styled.div`
  margin-top: 160px;
  background-color: #070036;
  height: 465px;
  display: flex;
  flex-direction: column;
`;

const AboutItemContainer = styled.div`
  margin-left: 100px;
  margin-right: 100px;
  margin-top: 50px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;
const AboutItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 20px;
  margin-right: 20px;
`;

const ItemImg = styled.img`
  height: 98.68px;
  width: 120px;
  display: block;
  margin-left: auto;
  margin-right: auto;
`;
const ItemText = styled.div`
  font-family: Roboto Slab;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  line-height: 24px;
  align-items: center;
  text-align: center;
  color: white;
`;
const PerformanceHeader = styled.div`
  font-family: Roboto Slab;
  font-style: normal;
  font-weight: bold;
  font-size: 40px;
  line-height: 53px;
  margin-top: 92px;
  text-align: center;
  color: white;
`;
const Performancetext = styled.div`
  font-family: Roboto Slab;
  font-style: normal;
  font-weight: bold;
  font-size: 30px;
  line-height: 53px;
  margin-top: 30px;
  text-align: center;
  color: white;
`;
const CardGroup = styled.div`
  margin-left: auto;
  margin-right: auto;
  width: 790px;
  margin-top: 70px;
  padding-bottom: 70px;
`;

const CardItem1 = styled.div`
  height: 308px;
  width: 255px;
  background-color: #5c2ef3;
  border-radius: 10px;
`;

const CardItem2 = styled.div`
  height: 308px;
  width: 255px;
  background-color: #e905fd;
  border-radius: 10px;
`;
const CardItem3 = styled.div`
  height: 308px;
  width: 255px;
  background-color: #0091f0;

  border-radius: 10px;
`;
const CardItem4 = styled.div`
  height: 308px;
  width: 255px;
  background-color: #fa991c;

  border-radius: 10px;
`;
const AboutIconCard = styled.i`
  color: white;
  margin-left: auto;
  margin-right: auto;
  margin-top: 23px;
  margin-bottom: 20px;
`;

export default function Landing(props) {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
  };

  return (
    <LandingContainer>
      <LandingText>Decentralized Social Trading for Options</LandingText>
      <DepositImg src={deposit} />
      <StartTXBtn clickTrade={props.clickTrade} />
      <AboutContainer>
        <AboutTitle>About Us</AboutTitle>
        <AboutItemContainer>
          <AboutItem>
            <ItemImg src={gamma} />
            Optional is a social trading platform for options built atop of the
            Gamma Protocol by Opyn.
            <ItemText>
              Optional is a social trading platform for options built atop of
              the Gamma Protocol by Opyn.
            </ItemText>
          </AboutItem>
          <AboutItem>
            <AboutIconCard className="fas fa-user-tie fa-4x" />
            Optional is a social trading platform for options built atop of the
            Gamma Protocol by Opyn.
            <ItemText>
              Optional is a social trading platform for options built atop of
              the Gamma Protocol by Opyn.
            </ItemText>
          </AboutItem>
          <AboutItem>
            <AboutIconCard className="fas fa-users  fa-4x" />
            Optional is a social trading platform for options built atop of the
            Gamma Protocol by Opyn.
            <ItemText>
              Optional is a social trading platform for options built atop of
              the Gamma Protocol by Opyn.
            </ItemText>
          </AboutItem>
          <AboutItem>
            <AboutIconCard className="fas fa-hand-holding-usd fa-4x" /> Optional
            is a social trading platform for options built atop of the Gamma
            Protocol by Opyn.
            <ItemText>
              Optional is a social trading platform for options built atop of
              the Gamma Protocol by Opyn.
            </ItemText>
          </AboutItem>
        </AboutItemContainer>
      </AboutContainer>
      <PerformanceHeader>Performance Leaderboard</PerformanceHeader>
      <Performancetext>Coming soon...</Performancetext>
      <CardGroup>
        <Slider {...settings}>
          <div>
            <CardItem1 />
          </div>
          <div>
            <CardItem2 />
          </div>
          <div>
            <CardItem3 />
          </div>
          <div>
            <CardItem4 />
          </div>
        </Slider>
      </CardGroup>
    </LandingContainer>
  );
}