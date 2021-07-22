import "../App.css";
import { Icon, Grid, Image } from "semantic-ui-react";

export default function TopSidebar(props) {
  return (
    <div className="topSidebar">
      <Grid style={{ marginRight: "0px" }}>
        <Grid.Column floated="left" width={5}>
          
        </Grid.Column>
        <Grid.Column floated="right" width={3}>
          {props.showSidebar ? (
            <div style={{ paddingTop: "15px" }}>
              <Icon name="close" size="big" onClick={props.clickHideSidebar} />
            </div>
          ) : (
            <div style={{ paddingTop: "15px" }}>
              <Icon
                name="sidebar"
                size="big"
                onClick={props.clickShowSidebar}
              />
              {/* <button onClick={props.clickHideSidebar}>
                <img src={cover} style={{ height: "30px", width: "30px" }} />
              </button> */}
            </div>
          )}
        </Grid.Column>
      </Grid>
    </div>
  );
}
