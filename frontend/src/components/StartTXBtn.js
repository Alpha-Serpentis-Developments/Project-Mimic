import "../App.css";

export default function StartTXBtn(props) {
  console.log(props);
  return (
    <button
      className="StartButtons"
      style={{
        verticalAlign: "middle",
        width: "280px",
        height: "50px",
        marginBottom: "20px",
        fontSize: "25px",
      }}
      onClick={props.clickTrade}
    >
      <span>Start Trading </span>
    </button>
  );
}
