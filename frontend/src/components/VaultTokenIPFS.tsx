import { Modal, Form, Input, Button } from "semantic-ui-react";
import { useState } from "react";
import { VaultToken_Meta } from "./VaultToken_meta";

export default function VaultTokenIPFS(props: {
    openIPFSModal: boolean;
    IPFSActive: boolean;
    onClose: any;
}) { 

    const IPFS = require('ipfs');
    const OrbitDB = require('orbit-db');

    const [disableBtn, setDisableBtn] = useState<boolean>(false);

    function startIPFS() {
        if(props.IPFSActive) {
            return;
        }

        new VaultToken_Meta(IPFS, OrbitDB);
    }

    function submitInfo() {
        startIPFS();
    }

    function closeModal() {
        props.onClose();
    }

    function isValidDescription(text: string) {
        if(text === "") {
            setDisableBtn(true);
        } else {
            setDisableBtn(false);
        }
    }

    return (
        <div>
            <Modal 
                open={props.openIPFSModal}
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