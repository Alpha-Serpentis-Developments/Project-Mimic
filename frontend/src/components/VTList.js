import { useEffect, useState } from "react";
import { HashRouter as Route, Switch } from "react-router-dom";

import { web3 } from "./Web3Handler";
import { Factory } from "./Factory";
import { VaultToken } from "./VaultToken";
import { Otoken } from "./Otoken";

import { ERC20 } from "./Erc20";
import Trade from "../pages/Trade";
import Landing from "../components/Landing";
import Managed from "../pages/Managed";
import TokenDes from "./TokenDes";

export default function VTList(props) {
  let cVT = JSON.parse(localStorage.getItem("cVT") || "{}");
  // let cVTAddr = JSON.parse(localStorage.getItem("cVTAddr") || "false");

  const [vtList, setVTList] = useState([]);
  const [update, setUpdate] = useState(0);
  const [managedList, setManagedList] = useState([]);
  const [portfolioList, setPortfolioList] = useState([]);
  const [followList, setFollowList] = useState([]);
  const [assetTokenList, setAssetTokenList] = useState([]);

  const [clickedItem, setClickedItem] = useState(cVT);
  const [sellCallList, setSellCallList] = useState([]);
  const [lastSellCall, setLastSellCall] = useState();
  // const [currentTokenAddr, setCurrentTokenAddr] = useState(cVTAddr);

  async function showTokenInfo(e, i) {
    console.log(i.value);
    await setClickedItem(i.value);
    //  await setCurrentTokenAddr(i.value.address);

    let T = i.value;
    function getCircularReplacer() {
      const seen = new WeakSet();
      return (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return;
          }
          seen.add(value);
        }
        return value;
      };
    }

    await localStorage.setItem("cVT", "");
    await localStorage.setItem("cVT", JSON.stringify(T, getCircularReplacer()));
    // await localStorage.setItem("cVTAddr", JSON.stringify(i.value.address));
  }

  function getAllVT() {
    let factoryObj = new Factory(web3);

    let p = factoryObj.findAllVT();
    let vTokenList = vtList;

    let foundNewToken = false;

    p.then((result) => {
      let events = result;
      for (let i = 0; i < events.length; i++) {
        let addr = events[i].returnValues.vaultToken;
        if (!include(addr, vTokenList)) {
          foundNewToken = true;
          let v = new VaultToken(web3, events[i].returnValues.vaultToken);
          vTokenList.push(v);
          let allSellCalls = v.findAllSellCalls();
          allSellCalls.then((result) => {
            setSellCallList(result);
            setLastSellCall(result[result.length - 1]);
            let oArr = [];
            for (let h = 0; h < result.length; h++) {
              web3.eth
                .getStorageAt(v.address, 11, result[h].blockNumber)
                .then((result) => {
                  let oAddr = `0x${result.slice(-40)}`;

                  let o = new Otoken(web3, oAddr);
                  o.getName().then((result) => {
                    o.setName(result);
                    oArr.push(result);
                    v.setAllOtokenName(oArr);
                  });
                });
            }
          });
        }
      }
      if (foundNewToken) {
        setVTList(vTokenList);
      }
    });
    setTimeout(() => {
      getAllVT();
    }, 10000);
  }

  function include(address, list) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].address === address) {
        return true;
      }
    }
    return false;
  }

  function populateManager(i) {
    let v = vtList[i];
    if (v.tName === "") {
      return;
    }
    if (v.manager === "") {
      v.getManager().then((result) => {
        v.setManager(result);
        // if the result === my addr
        // append the v to the managed list
        if (
          result.toLowerCase() === props.acctNum &&
          !include(result, managedList) &&
          (v.tName !== "t" || v.tName !== "token")
        ) {
          managedList.push(v);
          setManagedList(managedList);
          v.manageToken = true;
        }
      });
    }
  }

  function populateAsset(k) {
    let v = vtList[k];
    let found = false;
    if (v.asset === "") {
      let i = 0;
      v.getAsset().then((result) => {
        v.setAsset(result);
        for (i = 0; i < assetTokenList.length; i++) {
          if (assetTokenList[i].address === result) {
            found = true;
            vtList[k].assetObject = assetTokenList[i];
          }
        }

        if (!found) {
          let a = new ERC20(web3, result);
          // console.log("+++++++++" + v.tName);
          let p = assetTokenList;
          p.push(a);
          // vtList[i].assetObject = a;
          setAssetTokenList(p);
          // let n = [...vtList];
          // n[k].assetObject = a;
          // setVTList(n);
          vtList[k].assetObject = a;
        }
      });
    }
  }
  function normalizeValues(val, origDecimals, newDecimals) {
    let decimalDiff = origDecimals - newDecimals;

    if (decimalDiff > 0) {
      return val / 10 ** decimalDiff;
    } else if (decimalDiff < 0) {
      return val * 10 ** -decimalDiff;
    } else {
      return val;
    }
  }
  function populateName(i) {
    // v.getName().then((result) => {
    // });
    let v = vtList[i];
    if (v.tName === "") {
      v.getName(props.acctNum).then((result) => {
        v.setName(result);
      });
    }
    if (v.tSymbol === "") {
      v.getSymbol(props.acctNum).then((result) => {
        v.setSymbol(result);
      });
    }
    if (v.tDecimals === -1) {
      console.log("at decimals");
      v.getDecimals(props.acctNum).then((result) => {
        console.log(result);
        v.setDecimals(result);
      });
    }
    if (v.collateralAmount === -1) {
      v.getCA(web3, v.address).then((result) => {
        let da = web3.utils.toBN(result).toString();
        v.setCA(da);
      });
    }
    if (v.oTokenAddr === "") {
      v.getOT(web3, v.address).then((result) => {
        if (
          result !==
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        ) {
          let oAddr = `0x${result.slice(-40)}`;
          v.setOT(oAddr);
          if (v.oTokenAddr !== "") {
            let o = new Otoken(web3, v.oTokenAddr);
            v.oTokenObj = o;
            o.getName().then((result) => {
              o.setName(result);
            });
          }
        }
      });
    }
    if (v.collateralAmount !== -1 && v.vaultBalance !== -1) {
      let r = (parseInt(v.collateralAmount) + parseInt(v.vaultBalance)) / 1e18;
      let y;

      r = r.toFixed(5);
      if (lastSellCall === undefined) {
        y = 0;
      } else {
        y =
          (lastSellCall.returnValues.premiumReceived /
            1e18 /
            (normalizeValues(lastSellCall.returnValues.amountSold, 8, 18) /
              10 ** 18)) *
          100;
        y = y.toFixed(3);
      }

      v.setNAV(r + " " + v.assetObject.symbol());
      v.setYield(y + "%");
    }
  }
  function populateAssetName(i) {
    // v.getName().then((result) => {
    // });

    let v = assetTokenList[i];
    if (v.tName === "") {
      v.getName(props.acctNum)
        .then((result) => {
          v.setName(result);
        })
        .catch((error) => {
          v.setName("Non erc20 token");
          v.ercStatus = false;
        });
    }
    if (v.tSymbol === "") {
      v.getSymbol(props.acctNum)
        .then((result) => {
          v.setSymbol(result);
        })
        .catch((error) => {
          v.setSymbol("Non erc20 token");
          v.ercStatus = false;
        });
    }
    if (v.tDecimals === -1) {
      v.getDecimals(props.acctNum)
        .then((result) => {
          v.setDecimals(result);
        })
        .catch((error) => {
          v.setDecimals("Non erc20 token");
          v.ercStatus = false;
        });
    }
  }

  function populate() {
    // if (vtList.length === 0) {
    setTimeout(() => {
      setUpdate(update + 1);
    }, 3000);
    // }
    for (let i = 0; i < vtList.length; i++) {
      // if (vtList[i].name() === "Name") {
      populateName(i, vtList, setVTList);
      populateManager(i);
      populateAsset(i);
      //getting my balance for all the tokens in the list
      vtList[i].getBalance(props.acctNum).then((result) => {
        vtList[i].setBalance(result);
        // if result is bigger than 0
        // put the vtList[i] to in portfolio list
        // if it is not already there

        if (result > 0) {
          if (!include(vtList[i].address, portfolioList)) {
            portfolioList.push(vtList[i]);
            setPortfolioList(portfolioList);
          }
        }
      });

      // get vault tokens balance from asset token
      if (vtList[i].assetObject) {
        vtList[i].assetObject.getBalance(vtList[i].address).then((result) => {
          vtList[i].setVaultBalance(result);
        });
      }

      vtList[i].updateTotalSupply().then((result) => {
        vtList[i].setTotalSupply(result);
      });
      vtList[i].updateStatus();

      // findWithdrawalWindowActivated
      vtList[i].findWithdrawalWindowActivated().then((result) => {
        // console.log(
        //   vtList[i].tName + "     findWithdrawalWindowActivated +    "
        // );
        // console.log(result);
        if (result.length > 0) {
          let ts = result[result.length - 1].returnValues.closesAfter;
          vtList[i].expireTime = ts;
        }
      });
    }

    for (let i = 0; i < assetTokenList.length; i++) {
      // if (vtList[i].name() === "Name") {
      populateAssetName(i);
      // getting my balance for all the asset tokens
      assetTokenList[i].getBalance(props.acctNum).then((result) => {
        assetTokenList[i].setBalance(result);
      });

      assetTokenList[i].updateTotalSupply().then((result) => {
        assetTokenList[i].setTotalSupply(result);
      });
    }

    for (let i = 0; i < vtList.length; i++) {
      let v = vtList[i];
      if (
        !include(v.address, portfolioList) &&
        !include(v.address, managedList) &&
        !include(v.address, followList)
      ) {
        followList.push(v);
        setFollowList(followList);
      }
    }
    let nList = [];
    for (let i = 0; i < followList.length; i++) {
      let v = followList[i];
      if (
        !(include(v.address, portfolioList) || include(v.address, managedList))
      ) {
        nList.push(v);
      }
    }
    setFollowList(nList);
  }

  // function showTokenInfo(e, i) {
  //   setClickedItem(i.value);
  // }

  useEffect(() => {
    getAllVT();
    populate();
  }, []);
  useEffect(() => {
    populate();
  }, [update]);

  return (
    <div>
      <Switch>
        <Route exact path="/">
          <Landing
            clickHome={props.clickHome}
            clickTrade={props.clickTrade}
            clickManager={props.clickManager}
          />
        </Route>
        {/* <Route exact path="/detail/:id" component={Detail} /> */}
        <Route exact path="/trade">
          <Trade
            pList={portfolioList}
            fList={followList}
            update={update}
            title="Portfolio"
            acct={props.acctNum}
            showSpinner={vtList.length === 0}
            ethBal={props.ethBal}
            vtList={vtList}
            showTokenInfo={showTokenInfo}
          />
        </Route>
        <Route exact path="/managed">
          <Managed
            mList={managedList}
            update={update}
            title="Managed Vaults"
            acct={props.acctNum}
            mpAddress={props.mpAddress}
            showSpinner={vtList.length === 0}
            ethBal={props.ethBal}
            vtList={vtList}
            showTokenInfo={showTokenInfo}
            openModal={props.openModal}
          />
        </Route>

        <Route exact path="/vault/:address">
          <TokenDes
            //  currentTokenAddr={currentTokenAddr}
            token={clickedItem}
            acct={props.acctNum}
            mpAddress={props.mpAddress}
            ethBal={props.ethBal}
            sellCallList={sellCallList}
          />
        </Route>
      </Switch>
    </div>
  );
}
