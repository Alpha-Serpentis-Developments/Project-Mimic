import { Modal, Form, Input } from "semantic-ui-react";

export default function VaultTokenIPFS(props: {
    openIPFSModal: boolean;
    onClose: any;
}) {

    function closeModal() {
        props.onClose();
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
                            
                        />
                    </Form>
                </Modal.Content>
            </Modal>
        </div>
    );
}