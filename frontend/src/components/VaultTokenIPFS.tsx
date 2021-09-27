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
    const [signedStatus, setSignedStatus] = useState<boolean>(false);

    let VT_Meta: VaultToken_Meta;

    function startIPFS() {
        if(props.IPFSActive) {
            console.log("already active");
            return;
        }

        VT_Meta = new VaultToken_Meta(IPFS, OrbitDB);

        VT_Meta.onready = () => {
            console.log(VT_Meta.OrbitDB.id);
        }

        VT_Meta.create();
        props.setIPFSActive(true);
    }

    function stopIPFS() {
        VT_Meta.Ipfs.stop();
    }

    function signDescription() { // user will need to sign something to prove the description

    }

    function submitInfo() {
        startIPFS();
        closeModal();
    }

    function closeModal() {
        props.setIPFSModal(false);
    }

    function isValidDescription(text: string) {
        if(text === "") {
            setDisableBtn(true);
            return true;
        } else {
            setDisableBtn(false);
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