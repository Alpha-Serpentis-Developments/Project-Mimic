import deposit from "../images/deposit.png";
import StartTXBtn from "./StartTXBtn";
import gamma from "../images/gamma.png";
import styled from "styled-components";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import StartManagingBtn from "./StartManagingBtn";
import { Divider } from "semantic-ui-react";
import optionalProfile from "../images/optionalProfile.png";

const LandingContainer = styled.div`
  background-image: linear-gradient(#8b1bef, #20759d);
`;
const LandingText = styled.div`
  font-family: Roboto Slab;
  font-style: normal;
  font-weight: bold;
  font-size: 48px;
  line-height: 63px;
  text-align: center;
  padding-top: 41px;
  padding-bottom: 40px;
  color: white;
  @media (max-width: 700px) {
    font-size: 25px;
  }
`;
const DepositImg = styled.img`
  width: 588px;
  height: 36px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top: 32px;
  margin-bottom: 93px;
  @media (max-width: 500px) {
    margin-top: 20px;
    width: 350px;
    height: 25px;
  }
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
  background-color: #2800362e;
  height: 465px;
  display: flex;
  flex-direction: column;
  @media (max-width: 700px) {
    height: 900px;
  }
`;

const AboutItemContainer = styled.div`
  margin-left: 100px;
  margin-right: 100px;
  margin-top: 50px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  @media (max-width: 700px) {
    margin-left: auto;
    margin-right: auto;
    flex-direction: column;
  }
`;
const AboutItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 250px;
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
  @media (max-width: 700px) {
    width: 300px;
  }
`;

const CardItem1 = styled.div`
  height: 308px;
  // background-color: #5c2ef3;
  background-color: grey;
  border-radius: 10px;
  margin-right: 10px;
  margin-left: 10px;
`;

const CardItem2 = styled.div`
  height: 308px;

  background-color: #880a94;
  border-radius: 10px;
  margin-right: 10px;
  margin-left: 10px;
`;
const CardItem3 = styled.div`
  height: 308px;

  background-color: #0091f0;
  border-radius: 10px;
  margin-right: 10px;
  margin-left: 10px;
`;
const CardItem4 = styled.div`
  height: 308px;
  background-color: #fa991c;
  border-radius: 10px;
  margin-right: 10px;
  margin-left: 10px;
`;
const AboutIconCard = styled.i`
  color: white;
  margin-left: auto;
  margin-right: auto;
  margin-top: 23px;
  margin-bottom: 20px;
  &.icon1 {
    background: linear-gradient(#ff5f6d, #ffc371);
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
  }
  &.icon2 {
    background: linear-gradient(to right, #4ca1af, #c4e0e5);
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
  }
  &.icon3 {
    background: linear-gradient(to right, #3a1c71, #d76d77, #ffaf7b);
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
  }
`;
const CardHeader = styled.div`
  font-family: Roboto Slab;
  font-size: 20px;
  text-align: center;
  padding-top: 25px;
  margin-bottom: 25px;
  font-weight: bold;
`;
const CardHeader1 = styled.div`
  font-family: Roboto Slab;
  font-size: 20px;
  text-align: center;
  padding-top: 25px;
  margin-bottom: 25px;
  font-weight: bold;
  color: white;
`;
const CardContent2 = styled.div`
  font-family: Roboto Slab;
  font-size: 16px;
  margin-left: 20px;
  margin-right: 20px;
  color: white;
`;

const CardContent = styled.div`
  font-family: Roboto Slab;
  font-size: 16px;
  // text-align: center;
  margin-left: 20px;
  margin-right: 20px;
`;
const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  @media (max-width: 700px) {
    flex-direction: column;
  }
`;
export default function Landing(props) {
  let w = 2;
  if (window.innerWidth < 700) {
    w = 1;
  }
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: w,
    slidesToScroll: 1,
  };

  return (
    <LandingContainer>
      <LandingText>Decentralized Social Trading for Options</LandingText>
      <DepositImg src={deposit} />
      <ButtonContainer>
        <Link to="/trade">
          <StartTXBtn clickTrade={props.clickTrade} />
        </Link>
        <Link to="/managed">
          <StartManagingBtn clickManager={props.clickManager} />
        </Link>
      </ButtonContainer>
      <AboutContainer>
        <AboutTitle>About Us</AboutTitle>
        <AboutItemContainer>
          <AboutItem>
            <ItemImg src={gamma} />
            <ItemText>Powered by Opyn's Gamma Protocol</ItemText>
          </AboutItem>
          <AboutItem>
            <AboutIconCard className="fas fa-user-tie fa-4x icon1" />
            <ItemText>
              Enables Social Traders to utilize options to potentially enhance
              yield
            </ItemText>
          </AboutItem>
          <AboutItem>
            <AboutIconCard
              className="fas fa-users  fa-4x icon2"
              style={{ color: "#bc544b" }}
            />
            <ItemText>
              Followers can expose their assets to the growth of their favorite
              Social Trader
            </ItemText>
          </AboutItem>
          <AboutItem>
            <AboutIconCard
              className="fas fa-hand-holding-usd fa-4x icon3"
              style={{ color: "#ffdf00" }}
            />
            <ItemText>
              Social Traders can earn fees from deposits, withdrawals, and
              performance
            </ItemText>
          </AboutItem>
        </AboutItemContainer>
      </AboutContainer>
      {/* <PerformanceHeader>Performance Leaderboard</PerformanceHeader>
      <Performancetext>Coming soon...</Performancetext> */}
      <PerformanceHeader>FAQ</PerformanceHeader>

      <CardGroup>
        <Slider {...settings}>
          <div>
            <CardItem1>
              <CardHeader>What is a social token?</CardHeader>
              <Divider
                style={{
                  width: "80%",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
              <CardContent>
                Social tokens are essentially “vaults” where users deposit the
                respective asset and the social trader (manager) uses that to
                collateralize call options to create covered call options.
              </CardContent>
            </CardItem1>
          </div>
          <div>
            <CardItem2>
              {" "}
              <CardHeader1>What are options?</CardHeader1>
              <Divider
                style={{
                  width: "80%",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
              <CardContent2>
                Options are derivatives and essentially provide buyers a way to
                hedge against their assets (or place bets). Sellers can use
                options to make passive income with the premiums earned for
                writing options.
              </CardContent2>
            </CardItem2>
          </div>
          <div>
            <CardItem3>
              {" "}
              <CardHeader>What is a covered call?</CardHeader>
              <Divider
                style={{
                  width: "80%",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
              <CardContent>
                Covered calls is a type of strategy in options trading where
                call options are sold, but own the underlying to cover for an
                exercise.
              </CardContent>
            </CardItem3>
          </div>
          <div>
            <CardItem4>
              {" "}
              <CardHeader>What is an exercise?</CardHeader>
              <Divider
                style={{
                  width: "80%",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
              <CardContent>
                An exercise is when the option expires “in-the-money,” resulting
                in portions of the collateral being surrendered to the long
                holder. As a result, this may cause a social token to be down in
                the underlying asset (e.g., ETH, WBTC, etc.), but technically up
                in USD.
              </CardContent>
            </CardItem4>
          </div>
        </Slider>
      </CardGroup>
    </LandingContainer>
  );
}
