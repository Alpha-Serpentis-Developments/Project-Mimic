import React from "react";
import "../style/noMMModal.css";

export default function NoMMMModal(props: { onClick: any }) {
  console.log("callsing this functon");
  return (
    <div>
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={props.onClick}>
            &times;
          </span>
          <p>You don't have meta mask installed</p>
        </div>
      </div>
    </div>
  );
}
