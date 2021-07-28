import "../App.css";

export default function StartTXBtn(props) {
  return (
    <button
      className="StartButtons"
      style={{ verticalAlign: "middle" }}
      onClick={props.clickTrade}
    >
      <span>Start Trading </span>
    </button>
  );
}
