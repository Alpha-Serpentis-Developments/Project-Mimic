import { Modal, Form, Input, Button, GridRow, Grid } from "semantic-ui-react";
import { useState } from "react";
import { VaultToken_Meta } from "./VaultToken_meta";

export default function VaultTokenIPFS(props: {
    setIPFSModal: any;
    IPFSModal: boolean;
    IPFSActive: boolean;
    setIPFSActive: any;
    unverifiedDesc: string;
    setUnverifiedDesc: any;
    signDescription: any;
}) { 

    const IPFS = require('ipfs');
    const OrbitDB = require('orbit-db');

    const [disableBtn, setDisableBtn] = useState<boolean>(true);
    const [signedStatus, setSignedStatus] = useState<boolean>(false);
    const [dataSubmitted, setDataSubmitted] = useState<boolean>(false);

    let VT_Meta: VaultToken_Meta;

    function startIPFS() {
        if(props.IPFSActive) {
            console.log("IPFS is already active");
            return;
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
                            control={Input}
                            label="Token Description"
                            placeholder="Lorem ipsum"
                            required
                            onChange={(e: any) => {
                                isValidDescription(e.target.value);
                            }}
                        />
                        <Grid>
                            <Grid.Row>
                                <Form.Field 
                                    control={Button}
                                    onClick={submitInfo}
                                    content={"Submit Vault Info"}
                                    disabled={disableBtn}
                                />
                                <Form.Field
                                    control={Button}
                                    onClick={() => undefined}
                                    content={"Submit to IPFS"}
                                    disabled={disableBtn} 
                                />
                            </Grid.Row>
                        </Grid>
                    </Form>
                </Modal.Content>
            </Modal>
        </div>
    );
}