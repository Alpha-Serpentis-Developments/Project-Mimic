import "../App.css";

export default function StartManagingBtn(props) {
    return (
        <button
            className="StartButtons"
            style={{ verticalAlign: "middle" }}
            onClick={props.clickManager}
        >
            <span>Start Managing</span>
        </button>
    );
}