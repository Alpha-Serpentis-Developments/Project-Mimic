import React, { useState, useEffect } from "react";
import "semantic-ui-css/semantic.min.css";

import { web3 } from "./components/Web3Handler";
import VTList from "./components/VTList.js";
import {
  Button,
  Icon,
  Tab,
  Grid,
  Menu,
  Sidebar,
  Modal,
  Segment,
  Divider,
} from "semantic-ui-react";
import DeployNewVaultToken from "./components/DeployNewVaultToken";
import TopMenu from "./components/TopMenu";
import Introduction from "./components/Introduction";
import Footer from "./components/Footer";
import { AddressBook } from "./components/AddressBook";
import TopSidebar from "./components/TopSideBar";
import MMInstallModal from "./components/MMInstallModal.js";
import { nwConfig, currentChain, setChain } from "./components/NetworkConfig";
import AppReload from "./components/AppReload";
import ChainAlert from "./components/ChainAlert";
import "./App.css";

declare global {
  interface Window {
    ethereum: any;
  }
}

let nC: any = nwConfig;

export default function App() {
  let addr: string = JSON.parse(localStorage.getItem("account") || "false");

  const [hasMM, setHasMM] = useState<boolean>(false);
  const [btnText, setBtnText] = useState<string>("Connect MetaMask");
  const [acctNum, setAcctNum] = useState<string>(addr);
  const [chainId, setChainId] = useState<number | undefined>();
  const [ethBal, setEthBal] = useState<number | undefined>();
  const [mpAddress, setMPAddress] = useState<string>("");

  const [renderHome, setRenderHome] = useState<boolean>(true);
  const [renderManager, setRenderManager] = useState<boolean>(false);
  const [renderFollow, setRenderFollow] = useState<boolean>(false);
  const [renderPortfolio, setRenderPortfolio] = useState<boolean>(false);
  const [openPlusModal, setOpenPlusModal] = useState<boolean>(false);

  const [homeNav, setHomeNav] = useState("black");
  const [managerNav, setManagerNav] = useState("black");
  const [tradeNav, setTradeNav] = useState("black");
  const [mmColor, setMMColor] = useState("grey");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMMInstallModal, setShowMMInstallModal] = useState(false);
  const [reload, setReload] = useState(false);
  // state variable to let users now we only work on the kovan and
  const [showChainAlert, setShowChainAlert] = useState(false);
  //=======detect chain id change before==============
  // window.ethereum.on("chainChanged", (chainId: any) => {
  //   // setChainId(parseInt(chainId));
  //   if (parseInt(chainId, 16) !== 1 && parseInt(chainId, 16) !== 42) {
  //     setShowChainAlert(true);
  //     return;
  //   }

  //   setChain(parseInt(chainId, 16));
  //   setReload(true);
  //   // Handle the new chain.
  //   // Correctly handling chain changes can be complicated.
  //   // We recommend reloading the page unless you have good reason not to.
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 3000);
  // });
  /// =======================================
  // check if the meta mask is installed when the page load
  useEffect(() => {
    if (acctNum && acctNum !== "undefined") {
      const fFive = addr.slice(0, 10);
      const lFive = addr.slice(-8);
      let t = `${fFive}...${lFive}`;
      getChainID();
      setBtnText(t);
      getMarginPoolAddress();
    }

    hasMMInstall();
  }, []);

  function getMarginPoolAddress() {
    let ab = new AddressBook(web3);
    ab.getMarginPool().then((result) => {
      setMPAddress(result);
    });
  }
  async function getChainID() {
    const chain_Id: number = await web3.eth.getChainId();
    setChain(chain_Id);
    setChainId(chain_Id);
    setMMColor(nC[currentChain].color);
  }
  // check if meta mask is installed
  async function hasMMInstall() {
    if (typeof window.ethereum !== "undefined") {
      await setHasMM(true);
      window.ethereum.on("chainChanged", (chainId: any) => {
        // setChainId(parseInt(chainId));
        if (parseInt(chainId, 16) !== 1 && parseInt(chainId, 16) !== 42) {
          setShowChainAlert(true);
          return;
        }

        setChain(parseInt(chainId, 16));
        setReload(true);
        // Handle the new chain.
        // Correctly handling chain changes can be complicated.
        // We recommend reloading the page unless you have good reason not to.
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      });
      return;
    }
  }
  async function connectMM(e: any) {
    if (!hasMM) {
      // alert("You must install MetaMask first");
      setShowMMInstallModal(true);
    } else {
      // const accounts = await web3.eth.getAccounts();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const account: string = accounts[0];
      const fFive = account.slice(0, 10);
      const lFive = account.slice(-8);
      const wAddress = `${fFive}...${lFive}`;
      setAcctNum(account);
      setBtnText(wAddress);
      // const chain_Id = await web3.eth.getChainId();
      getChainID();
      const weiBal = await web3.eth.getBalance(account);
      const ethBal = parseInt(weiBal) / 1000000000000000000;
      // setChainId(chain_Id);
      setEthBal(ethBal);
      localStorage.setItem("account", JSON.stringify(account));
    }
  }

  function clickHome(e: any) {
    e.preventDefault();
    setRenderHome(true);
    setRenderManager(false);
    setRenderPortfolio(false);
    setRenderFollow(false);
    setHomeNav("purple");
    setManagerNav("black");
    setTradeNav("black");
  }
  function clickTrade(e: any) {
    e.preventDefault();
    setRenderHome(false);
    setRenderManager(false);
    setRenderPortfolio(true);
    setRenderFollow(true);
    setHomeNav("black");
    setManagerNav("black");
    setTradeNav("purple");
  }
  function clickManager(e: any) {
    e.preventDefault();
    setRenderHome(false);
    setRenderManager(true);
    setRenderPortfolio(false);
    setRenderFollow(false);
    setHomeNav("black");
    setManagerNav("purple");
    setTradeNav("black");
  }

  function openModal() {
    setOpenPlusModal(true);
  }

  function clickShowSidebar() {
    setShowSidebar(true);
  }
  function clickHideSidebar() {
    setShowSidebar(false);
  }

  function closeMMInstallModal() {
    setShowMMInstallModal(false);
  }

  return (
    <div>
      {reload && <AppReload chainId={chainId} reload={reload} />}
      {/* <Sidebar.Pushable> */}
      <Sidebar
        as={Menu}
        animation="overlay"
        icon="labeled"
        inverted
        onHide={() => setShowSidebar(false)}
        vertical
        visible={showSidebar}
        width="thin"
        color="purple"
      >
        <Menu.Item
          name="home"
          position="right"
          // active={menuActive === "home"}
          active={renderHome}
          // onClick={clickMenu}
          onClick={clickHome}
        >
          <div style={{ color: "white", fontSize: "25px" }}>Home</div>
        </Menu.Item>
        <Menu.Item
          name="trade"
          position="right"
          // active={menuActive === "trade"}
          active={renderFollow}
          // onClick={clickMenu}
          onClick={clickTrade}
        >
          <div style={{ color: "white", fontSize: "25px" }}>Trade</div>
        </Menu.Item>
        <Menu.Item
          name="manager"
          position="right"
          // active={menuActive === "manager"}
          active={renderManager}
          onClick={clickManager}
        >
          <div style={{ color: "white", fontSize: "25px" }}>Manager</div>
        </Menu.Item>
      </Sidebar>

      <Sidebar.Pusher dimmed={showSidebar}>
        <div
          className="content"
          // style={{
          //   backgroundImage: "linear-gradient(#eddbf4, #f54aefad)",
          // }}
        >
          <TopSidebar
            showSidebar={showSidebar}
            clickShowSidebar={clickShowSidebar}
            clickHideSidebar={clickHideSidebar}
          />
          <TopMenu
            btnText={btnText}
            acctNum={acctNum}
            chainId={chainId}
            ethBal={ethBal}
            connectMM={connectMM}
            clickHome={clickHome}
            clickTrade={clickTrade}
            clickManager={clickManager}
            renderHome={renderHome}
            renderManager={renderManager}
            renderFollow={renderFollow}
            renderPortfolio={renderPortfolio}
            homeNav={homeNav}
            tradeNav={tradeNav}
            managerNav={managerNav}
            mmColor={mmColor}
          />

          {renderHome && <Introduction clickTrade={clickTrade} />}
          {addr ? (
            <div>
              <VTList
                acctNum={acctNum}
                mpAddress={mpAddress}
                renderManager={renderManager}
                renderFollow={renderFollow}
                renderPortfolio={renderPortfolio}
              />
              {renderManager && (
                <Grid centered padded>
                  <Grid.Row />
                  <Button
                    icon="plus circle"
                    size="huge"
                    color="purple"
                    onClick={openModal}
                    disabled={!acctNum}
                  >
                    New Token
                  </Button>
                  <Grid.Row />
                  <Grid.Row />
                  <Grid.Row />
                </Grid>
              )}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                fontSize: "20px",
                marginTop: "20px",
                color: "red",
              }}
            >
              <Icon name="exclamation triangle" color="red" />
              Please install MetaMask
              {/* <a href="https://metamask.io/" style={{ fontWeight: "bold" }}>
                {" "}
                MetaMask
              </a>{" "} */}
            </div>
          )}
          <MMInstallModal
            showMMInstallModal={showMMInstallModal}
            closeMMInstallModal={closeMMInstallModal}
          />
          <ChainAlert showChainAlert={showChainAlert} />
          <DeployNewVaultToken
            openPlusModal={openPlusModal}
            onClose={() => setOpenPlusModal(false)}
            acctNum={acctNum}
          />
        </div>
        {!renderHome && (
          <>
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
            <Divider hidden />
          </>
        )}
        <Footer />
      </Sidebar.Pusher>
      {/* </Sidebar.Pushable> */}
    </div>
  );
}
