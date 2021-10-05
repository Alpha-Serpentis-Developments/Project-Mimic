import { Modal, Form, Input, Button, Grid, TextArea } from "semantic-ui-react";
import { useEffect, useState } from "react";
import { VaultToken_Meta } from "./VaultToken_meta";
import {
    recoverTypedSignature_v4 as recoverTypedSignatureV4,
  } from 'eth-sig-util';

export default function VaultTokenIPFS(props: {
    setIPFSModal: any;
    IPFSModal: boolean;
    web3: any;
    cVT: any;
}) { 
    const [disableBtn, setDisableBtn] = useState<boolean>(true);
    const [IPFSActive, setIPFSActive] = useState<boolean>(false);
    const [dataSubmitted, setDataSubmitted] = useState<boolean>(false);
    const [unverifiedDesc, setUnverifiedDesc] = useState("");
    const [managerSocial, setManagerSocial] = useState("");
    const [signedDesc, setSignedDesc] = useState("");
    const [VT_Meta, setVT_Meta] = useState<any>();

    useEffect(() => {
        if(VT_Meta !== undefined) {
            VT_Meta.onready = () => {
                console.log("IPFS started");
                console.log(VT_Meta.OrbitDB.id);
                VT_Meta.setActive(true);
            }
            setIPFSActive(true);
            VT_Meta.create();
        }
    }, [VT_Meta])

    function startIPFS() {
        const OrbitDB = require('orbit-db');
        const Ipfs = require('ipfs');

        if(IPFSActive) {
            return console.error("IPFS already active");
        }

        setVT_Meta(new VaultToken_Meta(Ipfs, OrbitDB));
    }

    function stopIPFS() {
        if(VT_Meta.active) {
            VT_Meta.node.stop();
            setIPFSActive(false);
            console.log("IPFS stopped");
        }
    }

    async function signDescription() {
    
        const msgParams = JSON.stringify({
          domain: {
              name: 'Optional Social Token Description',
              version: '1'
          },
          message: {
              description: unverifiedDesc,
              social: managerSocial,
              vaultToken: props.cVT.address,
              manager: props.cVT.manager,
              timestamp: (Math.floor(Date.now() / 1000))
          },
          primaryType: 'Description',
          types: {
              EIP712Domain: [
                  { name: 'name', type: 'string' },
                  { name: 'version', type: 'string' }
              ],
              Description: [
                  { name: 'description', type: 'string' },
                  { name: 'social', type: 'string' },
                  { name: 'vaultToken', type: 'address' },
                  { name: 'manager', type: 'address' },
                  { name: 'timestamp', type: 'uint256' }
              ]
          }
        });
    
        props.web3.currentProvider.sendAsync({
            method: 'eth_signTypedData_v4',
            params: [props.cVT.manager, msgParams],
            from: props.cVT.manager,
        }, (error: any, result: any) => {
    
            if(error)
                return console.error(error);
            if(result.error) {
                return console.error(result.error.message);
            }
    
            if(verifySignature(msgParams, props.cVT.manager, result.result)) {
              setSignedDesc(result.result);
              pushSignedDataToIPFS();
              return true;
            } else {
              return false;
            }
    
        });
    }

    function verifySignature(msgParams: any, from: any, sig: any) {
        let ethUtil = require('ethereumjs-util');

        const recovered = recoverTypedSignatureV4({
            data: JSON.parse(msgParams),
            sig: sig
        });

        if(
            ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)
        ) {
            return true;
        } else {
            alert("Signature failed to be verified");
            return false;
        }
    }

    async function pushSignedDataToIPFS() {
        if(!IPFSActive) {
            await startIPFS();
            console.log("last");
        } else {

        }
    }

    function submitInfo() {
        signDescription();
    }

    function closeModal() {
        if(IPFSActive) {
            stopIPFS();
        }
            props.setIPFSModal(false);
    }

    function isValidDescription(text: string) {
        if(text === "") {
            setDisableBtn(true);
            setUnverifiedDesc("");
            return true;
        } else {
            setDisableBtn(false);
            setUnverifiedDesc(text);
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
                                setManagerSocial(e.target.value);
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
                            </Grid.Row>
                        </Grid>
                    </Form>
                </Modal.Content>
            </Modal>
        </div>
    );
}