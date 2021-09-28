import { Modal, Form, Input, Button } from "semantic-ui-react";
import { useState } from "react";
import { VaultToken_Meta } from "./VaultToken_meta";

export default function VaultTokenIPFS(props: {
    setIPFSModal: any;
    IPFSModal: boolean;
    IPFSActive: boolean;
    setIPFSActive: any;
}) { 

    const IPFS = require('ipfs');
    const OrbitDB = require('orbit-db');

    const [disableBtn, setDisableBtn] = useState<boolean>(true);
    const [description, setDescription] = useState<string>("");
    const [signedStatus, setSignedStatus] = useState<boolean>(false);

    let VT_Meta: VaultToken_Meta;

    function startIPFS() {
        if(props.IPFSActive) {
            console.log("IPFS is already active");
            return;
        }

        VT_Meta = new VaultToken_Meta(IPFS, OrbitDB);

        VT_Meta.onready = () => {
            console.log(VT_Meta.OrbitDB.id);
        }

        console.log("IPFS started");
        VT_Meta.create();
        props.setIPFSActive(true);
    }

    function stopIPFS() {
        if(VT_Meta.onready !== undefined) {
           VT_Meta.Ipfs.stop();
            props.setIPFSActive(false);
           console.log("IPFS stopped");
        }
            
    }

    function submitInfo() {
        startIPFS();
        closeModal();
    }

    function closeModal() {
        props.setIPFSModal(false);
        stopIPFS();
    }

    function isValidDescription(text: string) {
        if(text === "") {
            setDisableBtn(true);
            setDescription(text);
            return true;
        } else {
            setDisableBtn(false);
            setDescription("");
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
                        <Form.Field 
                            control={Button}
                            onClick={submitInfo}
                            content={"Submit Vault Info"}
                            disabled={disableBtn}
                        />
                    </Form>
                </Modal.Content>
            </Modal>
        </div>
    );
}