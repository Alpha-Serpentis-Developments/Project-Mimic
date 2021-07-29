import "../App.css";

export default function StartManagingBtn(props) {
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
      onClick={props.clickManager}
    >
      <span>Start Managing</span>
    </button>
  );
}
