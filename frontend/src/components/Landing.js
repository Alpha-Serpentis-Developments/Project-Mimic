import deposit from "../images/deposit.png";
import StartTXBtn from "./StartTXBtn";
import gamma from "../images/gamma.png";
import styled from "styled-components";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import StartManagingBtn from "./StartManagingBtn";

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
  background-color: #2800362e;
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

  background-color: #e905fd;
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
`;
const CardHeader = styled.div`
  font-family: Roboto Slab;
  font-size: 20px;
  text-align: center;
  padding-top: 25px;
  margin-bottom: 25px;
`;

const CardContent = styled.div`
  font-family: Roboto Slab;
  font-size: 16px;
  // text-align: center;
  margin-left: 10px;
  margin-right: 10px;
`;
export default function Landing(props) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
  };

  return (
    <LandingContainer>
      <LandingText>Decentralized Social Trading for Options</LandingText>
      <DepositImg src={deposit} />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
        }}
      >
        <Link to="/trade">
          <StartTXBtn clickTrade={props.clickTrade} />
        </Link>
        <Link to="/managed">
          <StartManagingBtn clickManager={props.clickManager} />
        </Link>
      </div>
      <AboutContainer>
        <AboutTitle>About Us</AboutTitle>
        <AboutItemContainer>
          <AboutItem>
            <ItemImg src={gamma} />
            <ItemText>Powered by Opyn's Gamma Protocol</ItemText>
          </AboutItem>
          <AboutItem>
            <AboutIconCard className="fas fa-user-tie fa-4x" />
            <ItemText>
              Enables Social Traders to utilize options to potentially enhance
              yield
            </ItemText>
          </AboutItem>
          <AboutItem>
            <AboutIconCard className="fas fa-users  fa-4x" />
            <ItemText>
              Followers can expose their assets to the growth of their favorite
              Social Trader
            </ItemText>
          </AboutItem>
          <AboutItem>
            <AboutIconCard className="fas fa-hand-holding-usd fa-4x" />
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
              <CardHeader>What are options?</CardHeader>
              <CardContent>
                Options are derivatives and essentially provide buyers a way to
                hedge against their assets (or place bets). Sellers can use
                options to make passive income with the premiums earned for
                writing options.
              </CardContent>
            </CardItem2>
          </div>
          <div>
            <CardItem3>
              {" "}
              <CardHeader>What is a covered call?</CardHeader>
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
