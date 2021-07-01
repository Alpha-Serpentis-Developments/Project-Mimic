import { Icon } from "semantic-ui-react";

import "../App.css";

export default function SuccessMessage() {
  const socialStyle = {
    textDecoration: "none",
    color: "purple",
    fontSize: "20px",
    fontWeight: "bold",
    transition: "transform 0.5s",
    cursor: "pointer",
  };
  return (
    <div
      style={{
        textAlign: "center",
        paddingBottom: "10px",
        paddingTop: "10px",
        display: "flex",
        flexDirection: "center",
        justifyContent: "space-evenly",
        position: "fixed",
        left: "0",
        bottom: "0",
        width: "100%",
      }}
    >
      <div style={socialStyle} className="socialLink">
        <a
          style={{ color: "purple" }}
          href="https://twitter.com/Official_ASDev"
        >
          <Icon name="twitter" />
          Twitter{" "}
        </a>
      </div>
      <div style={socialStyle} className="socialLink">
        <a
          style={{ color: "purple" }}
          href="https://github.com/Alpha-Serpentis-Developments/Project-Mimic"
        >
          <Icon name="github" />
          Github
        </a>
      </div>
      <div style={socialStyle} className="socialLink">
        <a style={{ color: "purple" }} href="https://discord.gg/u9wMgBY">
          <Icon name="discord" />
          Discord
        </a>
      </div>
    </div>
  );
}
