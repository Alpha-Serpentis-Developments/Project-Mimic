import StartTXBtn from "./StartTXBtn";

import "../App.css";

export default function Introduction(props) {
  const aboutTextStyle = {
    lineHeight: "1.5",
    paddingBottom: "20px",
    paddingLeft: "15px",
    paddingRight: "15px",
  };
  const cardHeaderStyling = {
    paddingTop: "45px",
    fontWeight: "bold",
    borderTopLeftRadius: "30px",
    borderTopRightRadius: "30px",
  };

  return (
    <div
      className="introductionPage"
      style={{
        backgroundImage: "linear-gradient(#eddbf4, #f54aefad)",
      }}
    >
      <img src={profileImg} alt="optional logo" className="optionalBodyImg" />

      <h2
        style={{
          textAlign: "center",
        }}
      >
        Decentralized Social Trading for Options
      </h2>
      <h2
        style={{
          textAlign: "center",
        }}
      >
        You Deposit. They Trade. You Earn.
      </h2>
      <StartTXBtn clickTrade={props.clickTrade} />
      <div className="introCards">
        <div className="aboutCard">
          <h1 style={cardHeaderStyling}>About Optional</h1>
          <br />
          <p style={aboutTextStyle}>
            Optional is a social trading platform for options built atop of the
            Gamma Protocol by Opyn.
          </p>
          <p style={aboutTextStyle}>
            Optional enables people to deposit funds into specially managed
            vault-style tokens that allows the depositor to earn while the
            social trader makes the moves for you to potentially grow your
            assets.
          </p>
          <p style={aboutTextStyle}>
            Additionally, managers can use their following to enable followers
            frictionless access to their moves without the use of bots and or
            constant monitoring of the trader.
          </p>
        </div>

        <div className="aboutCard">
          {" "}
          <h1 style={cardHeaderStyling}>Performance Leaderboard</h1>
          <br />
          <div style={aboutTextStyle}>
            <p style={{ paddingTop: "45px" }}>Coming Soon ...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
