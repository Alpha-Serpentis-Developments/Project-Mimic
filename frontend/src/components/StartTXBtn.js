import "../App.css";

export default function StartTXBtn(props) {
  return (
    <button
      className="StartTXBtn"
      style={{ verticalAlign: "middle" }}
      onClick={props.clickTrade}
    >
      <span>Start Trading </span>
    </button>
  );
}
