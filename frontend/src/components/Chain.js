import React from "react";

const ChainSelect = [
  {
    key: "1",
    text: "Ropsten",
    value: "3",
  },
  {
    key: "2",
    text: "Kovan",
    value: "42",
  },
];

export default function Chain() {
  return (
    <Form>
      <Form.Field
        control={Input}
        label="Controller Address"
        placeholder="Controller Address"
        value={controllerAddr}
        required
      />
      <Form.Field
        control={Input}
        label="Manager Address"
        placeholder="Manager Address"
        value={managerAddr}
        required
      />
      <Form.Field>
        <Header size="small">Asset Token Address</Header>
        <Dropdown
          onChange={(e, data) => setAssetTokenAddr(data.value)}
          allowAdditions
          options={assetTokenAddrs}
          placeholder="Asset Token Address"
          selection
          value={assetTokenAddr}
          widths="2"
        />
      </Form.Field>
    </Form>
  );
}
