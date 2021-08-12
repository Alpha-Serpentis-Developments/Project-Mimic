import { useState, useEffect } from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { Link } from "react-router-dom";

import "semantic-ui-css/semantic.min.css";

import { web3 } from "./components/Web3Handler";
import VTList from "./components/VTList.js";
import { Icon, Menu, Sidebar, Message } from "semantic-ui-react";
import DeployNewVaultToken from "./components/DeployNewVaultToken";
import NavBar from "./components/NavBar";
import Landing from "./components/Landing";
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
  let isVisit: boolean = JSON.parse(localStorage.getItem("new") || "true");
  console.log(isVisit);
  const [visited, setVisited] = useState(isVisit);

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

  const [homeNav, setHomeNav] = useState("#8b1bef");
  const [managerNav, setManagerNav] = useState("#8b1bef");
  const [tradeNav, setTradeNav] = useState("#8b1bef");
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
      getAccountDetail();
    }
    localStorage.setItem("new", JSON.stringify(visited));
    hasMMInstall();
  }, []);

  async function clickToVisit() {
    await setVisited(false);
    localStorage.setItem("new", "false");
  }

  async function getAccountDetail() {
    getChainID();
    const weiBal = await web3.eth.getBalance(acctNum);
    console.log(weiBal);
    const ethBal = parseInt(weiBal) / 1000000000000000000;
    // setChainId(chain_Id);
    setEthBal(ethBal);
  }

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
      getAccountDetail();
      localStorage.setItem("account", JSON.stringify(account));
    }
  }

  function clickHome(e: any) {
    setRenderHome(true);
    setRenderManager(false);
    setRenderPortfolio(false);
    setRenderFollow(false);
    setHomeNav("#9489ffba");
    setManagerNav("#8b1bef");
    setTradeNav("#8b1bef");
  }
  function clickTrade(e: any) {
    console.log("clicked trade=======");
    setRenderHome(false);
    setRenderManager(false);
    setRenderPortfolio(true);
    setRenderFollow(true);
    setHomeNav("#8b1bef");
    setManagerNav("#8b1bef");
    setTradeNav("#9489ffba");
  }
  function clickManager(e: any) {
    setRenderHome(false);
    setRenderManager(true);
    setRenderPortfolio(false);
    setRenderFollow(false);
    setHomeNav("#8b1bef");
    setManagerNav("#9489ffba");
    setTradeNav("#8b1bef");
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
    // <Router>
    <div>
      <Router>
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
          style={{ backgroundColor: "#8b1bef" }}
        >
          <Menu.Item
            name="home"
            position="right"
            // active={menuActive === "home"}
            active={renderHome}
            // onClick={clickMenu}
            onClick={clickHome}
          >
            <Link to="/">
              <div style={{ color: "white", fontSize: "25px" }}>Home</div>
            </Link>
          </Menu.Item>
          <Menu.Item
            name="trade"
            position="right"
            // active={menuActive === "trade"}
            active={renderFollow}
            // onClick={clickMenu}
            onClick={clickTrade}
          >
            <Link to="/trade">
              <div style={{ color: "white", fontSize: "25px" }}>Trade</div>
            </Link>
          </Menu.Item>
          <Menu.Item
            name="manager"
            position="right"
            // active={menuActive === "manager"}
            active={renderManager}
            onClick={clickManager}
          >
            <Link to="/managed">
              <div style={{ color: "white", fontSize: "25px" }}>Manager</div>
            </Link>
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
            <NavBar
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
              visited={visited}
              clickToVisit={clickToVisit}
            />
            {!addr && renderHome && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "20px",
                  backgroundColor: "#8b1bef",
                  color: "red",
                }}
              >
                <Message color="purple" compact>
                  <Icon name="exclamation triangle" color="red" />
                  Please install MetaMask to continue
                </Message>
                <Landing />
              </div>
            )}
            {/* 
            {!addr && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "20px",
                  backgroundColor: "#8b1bef",
                  color: "red",
                }}
              >
                <Message color="purple" compact>
                  <Icon name="exclamation triangle" color="red" />
                  Please install MetaMask to continue
                </Message>
              </div>
            )} */}

            {addr && (
              <div>
                <VTList
                  acctNum={acctNum}
                  mpAddress={mpAddress}
                  renderManager={renderManager}
                  renderFollow={renderFollow}
                  renderPortfolio={renderPortfolio}
                  ethBal={ethBal}
                  openModal={openModal}
                  clickHome={clickHome}
                  clickTrade={clickTrade}
                  clickManager={clickManager}
                />
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
          {/* {!renderHome && (
          <div style={{ backgroundImage: "linear-gradient(#493CB3,#1A5387)" }}>
            <Divider hidden style={{ marginTop: "0px" }} />
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
            <Divider hidden style={{ marginBottom: "0px" }} />
          </div>
        )} */}
          <Footer />
        </Sidebar.Pusher>
        {/* </Sidebar.Pushable> */}
      </Router>
    </div>

    // </Router>
  );
}
