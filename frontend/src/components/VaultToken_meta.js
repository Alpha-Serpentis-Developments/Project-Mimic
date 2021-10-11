export class VaultToken_Meta {
    constructor(Ipfs, OrbitDB) {
        this.Ipfs = Ipfs;
        this.OrbitDB = OrbitDB;
        this.onready = "";
        this.active = false;
    }

    setActive(setting) {
        this.active = setting;
    }

    async create() {
        this.node = await this.Ipfs.create({
            repo: './ipfs',
            EXPERIMENTAL: { pubsub: true }
        });

        await this._init();
    }

    async _init() {
        this.orbitdb = await this.OrbitDB.createInstance(this.node);
        this.defaultOptions = { accessController: {
            write: [this.orbitdb.identity.id]
            }
        }
        const docStoreOptions = {
            ...this.defaultOptions,
            indexBy: 'hash',
        }
        this.descriptions = await this.orbitdb.docstore('descriptions', docStoreOptions);
        await this.descriptions.load();
        this.setActive(true);
        
        if(this.onready) this.onready();
    }

    async getDescriptionsID() {
        return await this.descriptions.id;
    }

    getAllDescriptions() {
        return this.descriptions.get('');
    }

    getDescriptionByHash(hash) {
        return this.descriptions.get(hash)[0];
    }

    async updateDescriptionByHash(hash, unsignedData, signature) {
        const description = await this.getDescriptionByHash(hash);
        description.unsignedData = unsignedData;
        description.signature = signature;
        
        return await this.descriptions.put(description);
    }

    async deleteDescriptionByHash(hash) {
        return await this.descriptions.del(hash);
    }

    async addNewDescription(hash, unsignedData, signature) {
        // we assume that unsignedData and signature have been verified against each other
        // a final check will be added in the future on the depositor end to verify the content is valid
        const existingDescription = this.getDescriptionByHash(hash);
        if(existingDescription) {
            return await this.updateDescriptionByHash(hash, unsignedData, signature);
        }
        
        const cid = await this.descriptions.put({hash, unsignedData, signature})
        return cid;
    }
}