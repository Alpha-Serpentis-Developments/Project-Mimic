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

        this._init();
    }

    async _init() {
        this.OrbitDB = await this.OrbitDB.createInstance(this.node);
        this.defaultOptions = { accessController: {
            write: [this.OrbitDB.identity.id]
            }
        }
        if(this.onready) this.onready();
    }
}