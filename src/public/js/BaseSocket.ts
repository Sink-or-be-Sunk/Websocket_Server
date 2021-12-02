class BaseSocket {
	// ERRORS
	private readonly SOCKET_NOT_OPEN =
		"Must wait for socket to be open before sending message";
	// CLIENT HEADERS
	private readonly CONNECTED = "CONNECTED";

	private readonly INIT_CONNECTION = "INIT CONNECTION";

	/** unique identifier: either username for web or device id for mcu */
	private uid: string;
	private socket: WebSocket;
	private superThis: any;

	constructor(uid: string, superThis: any) {
		this.uid = uid;
		this.superThis = superThis;
		//FIXME: NEED TO FIND A WAY TO ID THIS AS A WEB VS MCU REQUEST, maybe have MCU send device id and do database call for username

		const protocol = location.protocol == "https:" ? "wss" : "ws";
		const uri = protocol + "://" + location.hostname + ":" + location.port;
		this.socket = new WebSocket(uri);

		this.socket.onmessage = (event: any) => {
			superThis._onmessage(event);
		};
		this.socket.onopen = (event: any) => {
			console.log(event);
			this.send({ req: this.INIT_CONNECTION, id: this.uid });
			this.configureConnection();
			superThis._onopen
				? superThis._onopen(event)
				: console.warn("No onopen() callback");
		};
	}

	private configureConnection() {
		const obj = { req: this.CONNECTED, id: this.uid };
		const str = JSON.stringify(obj);

		this.socket.send(str);
		const interval = setInterval(() => {
			if (this.socket.readyState == this.socket.OPEN) {
				this.socket.send(str);
			} else {
				console.error(
					"Websocket Disconnected.  Refreshing Page in 5 seconds",
				);
				setTimeout(() => {
					location.reload();
				}, 5000);
				clearInterval(interval);
			}
			// this._send(obj); //TODO: MAYBE UPDATE THIS BACK TO COMMON _send() FUNCTION BUT REALLY ANNOYING CONSOLE LOGS
		}, 1000);
	}
	public send(obj: any) {
		if (this.socket.readyState == this.socket.OPEN) {
			console.info("Sending Message:");
			console.info(obj);
			const str = JSON.stringify(obj);
			this.socket.send(str);
		} else {
			console.error(this.SOCKET_NOT_OPEN);
		}
	}
}
