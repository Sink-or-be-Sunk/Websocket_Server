export default class Player {
	/**
	 * id of player device (mac address)
	 */
	id: string;
	/**
	 * username of player based on mongo db profile
	 */
	name: string;
	/**
	 * Indicated Player is ready to start, i.e. there ships are all in place
	 */
	ready: boolean;

	constructor(id: string, name?: string) {
		this.id = id;
		this.name = name ?? "NA";
		this.ready = false;
	}
}
