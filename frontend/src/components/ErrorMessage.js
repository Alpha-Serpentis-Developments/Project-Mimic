import React from "react";
import { Message } from "semantic-ui-react";

export default function ErrorMessage() {
  return (
    <Message
      header="Error"
      content="Please make sure to enter all fields"
      negative
      size="small"
    />
  );
}
