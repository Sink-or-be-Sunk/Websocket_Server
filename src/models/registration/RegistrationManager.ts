import ServerMessenger from "../../util/ServerMessenger";
import { WSClientMessage, REQ_TYPE } from "../../util/WSClientMessage";
import WSServerMessage from "../../util/WSServerMessage";
import WebSocket from "ws";
import { RegisterRequest } from "./RegisterRequest";
export class RegistrationManager {
    private pending: RegisterRequest[]
    static readonly TAG = "REGISTRATION"

    constructor() {
        this.pending = [];
    }

    public handleReq(
        socket: WebSocket,
        message: WSClientMessage,
    ): WSServerMessage {
        if (message.req == REQ_TYPE.REGISTER) {

            if (this.isPending(message.id)) {
                return ServerMessenger.REGISTER_PENDING;
            } else {
                const req = new RegisterRequest(message.data);
                if (req.valid) {
                    return ServerMessenger.REGISTER_PENDING;
                } else {
                    return ServerMessenger.bad_client_msg(message.data, RegistrationManager.TAG);
                }
            }
            //attempt to create new game
            if (this.getGame(message.id)) {
                return ServerMessenger.reqError("Game Already Exists");
            }
            const type = parseGameType(message.data);
            const game = new Game(message.id, socket, type); //use the unique MAC address of MCU to generate game id
            this.games.push(game);
            return ServerMessenger.GAME_CREATED;
        } else {
            throw Error("WSMessage is not valid.  This should never occur");
        }
    }

    private isPending(id: string): boolean {

    }

}