export function sendTX(c, label) {
  // eval[c]
  c
    // .on("receipt", function (receipt) {
    //   console.log(receipt);
    //   setSM("TX Receipt Received", "", true, false);
    // })
    .on("transactionHash", function (hash) {
      setTxHash(hash);
      setSM("TX Hash Received", hash, true, false);
    })
    .on("error", function (error, receipt) {
      let m = "";
      if (error !== null) {
        let i = error.message.indexOf(":");
        m = error.message.substring(0, i > 0 ? i : 40);
      }
      setSM(label + " TX Error", m, true, true);
      setTxSent(false);
      setIconStatus("error");
    })
    .on("confirmation", function (confirmationNumber, receipt) {
      // setSM(
      //   label + " TX Confirmed",
      //   confirmationNumber + " Confirmation Received",
      //   true,
      //   false
      // );
      // setIconStatus("confirmed");
      if (confirmationNumber === 1) {
        setSM(label + " TX Confirmed", "Confirmation Received", true, false);
        setIconStatus("confirmed");
      }
    });
}
