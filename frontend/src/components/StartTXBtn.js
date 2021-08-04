import "../App.css";

export default function StartTXBtn(props) {
  return (
    <button
      className="StartButtons"
      style={{
        verticalAlign: "middle",
        width: "280px",
        height: "50px",
        marginBottom: "20px",
        fontSize: "25px",
        marginRight: "20px",
      }}
      onClick={props.clickTrade}
    >
      <span>Start Trading </span>
    </button>
  );
}
