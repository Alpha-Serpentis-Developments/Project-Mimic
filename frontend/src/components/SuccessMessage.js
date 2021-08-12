import { Message } from "semantic-ui-react";

export default function SuccessMessage() {
  return (
    <Message
      header="Great!"
      content="The transaction has been sent"
      size="small"
    />
  );
}
