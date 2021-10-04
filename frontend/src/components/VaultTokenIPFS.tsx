import { Modal, Form, Input, Button, Grid, TextArea } from "semantic-ui-react";
import { useState } from "react";
import { VaultToken_Meta } from "./VaultToken_meta";

export default function VaultTokenIPFS(props: {
    setIPFSModal: any;
    IPFSModal: boolean;
    IPFSActive: boolean;
    setIPFSActive: any;
    unverifiedDesc: string;
    setUnverifiedDesc: any;
    setManagerSocial: any;
    signDescription: any;
    signedDesc: string;
    timestamp: number;
}) { 

    const IPFS = require('ipfs');
    const OrbitDB = require('orbit-db');

    const [disableBtn, setDisableBtn] = useState<boolean>(true);
    const [disableIPFSBtn, setDisableIPFSBtn] = useState<boolean>(true);
    const [dataSubmitted, setDataSubmitted] = useState<boolean>(false);

    let VT_Meta: VaultToken_Meta;

    function startIPFS() {
        if(props.IPFSActive) {
            return console.error("IPFS already active");
        }
        if(props.signedDesc === "") {
            return console.error("Signed description does not exist");
        }

        VT_Meta = new VaultToken_Meta(IPFS, OrbitDB);

        VT_Meta.onready = () => {
            console.log("IPFS started");
            console.log(VT_Meta.OrbitDB.id);
            console.log(VT_Meta);
        }

        VT_Meta.create();
        props.setIPFSActive(true);
    }

    function stopIPFS() {
        console.log(VT_Meta);
        if(VT_Meta.onready !== undefined) {
           VT_Meta.Ipfs.stop();
            props.setIPFSActive(false);
           console.log("IPFS stopped");
        }
    }

    function submitInfo() {
        props.setUnverifiedDesc()
        props.signDescription();
    }

    function closeModal() {
        if(props.IPFSActive && props.unverifiedDesc === "") {
            stopIPFS();
        }
            props.setIPFSModal(false);
    }

    function isValidDescription(text: string) {
        if(text === "") {
            setDisableBtn(true);
            props.setUnverifiedDesc("");
            return true;
        } else {
            setDisableBtn(false);
            props.setUnverifiedDesc(text);
            return false;
        }
    }

    return (
        <div>
            <Modal 
                open={props.IPFSModal}
                onClose={closeModal}
                closeIcon
                size="small"
            >
                <Modal.Content>
                    <Form>
                        <Form.Field
                            control={TextArea}
                            label="Description"
                            placeholder="The vault's strategy is..."
                            required
                            onChange={(e: any) => {
                                isValidDescription(e.target.value);
                            }}
                        />
                        <Form.Field 
                            control={Input}
                            label="Social Media"
                            placeholder="twitter.com/OptionalFinance"
                            required
                            onChange={(e: any) => {
                                props.setManagerSocial(e.target.value);
                            }}
                        />
                        <Grid
                            style={{
                                marginLeft: "0%"
                            }}
                        >
                            <Grid.Row>
                                <Form.Field 
                                    control={Button}
                                    onClick={submitInfo}
                                    content={"Sign Description"}
                                    disabled={disableBtn}
                                />
                                <Form.Field
                                    control={Button}
                                    onClick={startIPFS}
                                    content={"Submit to IPFS"}
                                    disabled={disableIPFSBtn} 
                                />
                            </Grid.Row>
                        </Grid>
                    </Form>
                </Modal.Content>
            </Modal>
        </div>
    );
}