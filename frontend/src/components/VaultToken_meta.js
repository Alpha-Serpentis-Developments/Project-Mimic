export class VaultToken_Meta {
    constructor(Ipfs) {
        this.Ipfs = Ipfs;
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
        this.setActive(true);
        
        if(this.onready) this.onready();
    }
}