import Lobby from "../../src/models/gameplay/Lobby";
import { MOVE_TYPE } from "../../src/models/gameplay/Move";
import { Game, GAME_TYPE, Response, ResponseHeader } from "../../src/models/gameplay/Game";
import { WSClientMessage, REQ_TYPE } from "../../src/util/WSClientMessage"
import ServerMessenger from "../../src/util/ServerMessenger"
import Player from "../../src/models/gameplay/Player";
import TestUtils from "../../testUtils/TestUtils";
import { SHIP_DESCRIPTOR } from "../../src/models/gameplay/Ship";
import { Position, LAYOUT_TYPE } from "../../src/models/gameplay/Layout";


describe("Handle Lobby Requests ", () => {
    const lobby = new Lobby();

    it("Accepts New Game Request", () => {
        const obj = { req: REQ_TYPE.NEW_GAME, id: "one" };
        const msg = new WSClientMessage(JSON.stringify(obj));
        const resp = lobby.handleReq(msg);
        expect(resp).toEqual(ServerMessenger.GAME_CREATED)
    });

    it("Accept Join Game Request", () => {
        const obj = { req: REQ_TYPE.JOIN_GAME, id: "two", data: "one" };
        const msg = new WSClientMessage(JSON.stringify(obj));
        const resp = lobby.handleReq(msg);
        expect(resp).toEqual(ServerMessenger.joined(obj.data))
    });

    it("Reject Join Game Request from Player One already in game", () => {
        const obj = { req: REQ_TYPE.JOIN_GAME, id: "one", data: "one" };
        const msg = new WSClientMessage(JSON.stringify(obj));
        const resp = lobby.handleReq(msg);
        expect(resp).toEqual(ServerMessenger.invalid_join(ResponseHeader.ALREADY_IN_GAME))
    });

    it("Reject Join Game Request from Player Two already in game", () => {
        const obj = { req: REQ_TYPE.JOIN_GAME, id: "two", data: "one" };
        const msg = new WSClientMessage(JSON.stringify(obj));
        const resp = lobby.handleReq(msg);
        expect(resp).toEqual(ServerMessenger.invalid_join(ResponseHeader.ALREADY_IN_GAME))
    });

    /**
     * 0|P|D| | | | | | |
     * 1|P|D| | | | | | |
     * 2| |D| | | | | | |
     * 3| | | | | | | | |
     * 4| | | | | | | | |
     * 5| | | | | | | | |
     * 6| | | | | | | | |
     * 7| | | | | | | | |
     *  |0|1|2|3|4|5|6|7|
     */
    it("Allow Player 1 to position ships", () => {
        const pos0 = new Position(0, 0, LAYOUT_TYPE.PATROL);
        const pos1 = new Position(0, 1, LAYOUT_TYPE.PATROL);
        const pos2 = new Position(1, 0, LAYOUT_TYPE.DESTROYER);
        const pos3 = new Position(1, 2, LAYOUT_TYPE.DESTROYER);
        const list = [pos2, pos1, pos0, pos3];
        const obj = { req: REQ_TYPE.POSITION_SHIPS, id: "one", data: list };
        const str = JSON.stringify(obj);
        const msg = new WSClientMessage(str);
        const resp = lobby.handleReq(msg);
        expect(resp).toEqual(ServerMessenger.LAYOUT_APPROVED);
    });

    /**
     * 0|P|D| | | | | | |
     * 1|P|D| | | | | | |
     * 2| |D| | | | | | |
     * 3| | | | | | | | |
     * 4| | | | | | | | |
     * 5| | | | | | | | |
     * 6| | | | | | | | |
     * 7| | | | | | | | |
     *  |0|1|2|3|4|5|6|7|
     */
    it("Allow Player 2 to position ships", () => {
        const pos0 = new Position(0, 0, LAYOUT_TYPE.PATROL);
        const pos1 = new Position(0, 1, LAYOUT_TYPE.PATROL);
        const pos2 = new Position(1, 0, LAYOUT_TYPE.DESTROYER);
        const pos3 = new Position(1, 2, LAYOUT_TYPE.DESTROYER);
        const list = [pos2, pos1, pos0, pos3];
        const obj = { req: REQ_TYPE.POSITION_SHIPS, id: "two", data: list };
        const str = JSON.stringify(obj);
        const msg = new WSClientMessage(str);
        const resp = lobby.handleReq(msg);
        expect(resp).toEqual(ServerMessenger.LAYOUT_APPROVED);
    });

    it("Allow Player 1 to make a move", () => {
        const move = {
            type: MOVE_TYPE.SOLO,
            c: 0,
            r: 0,
            at: "two",
        };
        const obj = { req: REQ_TYPE.MAKE_MOVE, id: "one", data: move };
        const str = JSON.stringify(obj);
        const msg = new WSClientMessage(str);
        const resp = lobby.handleReq(msg);
        expect(resp).toEqual(ServerMessenger.MOVE_MADE);
    });

    it("Allow Player 1 to make a move", () => {
        const move = {
            type: MOVE_TYPE.SOLO,
            c: 0,
            r: 0,
            at: "two",
        };
        const obj = { req: REQ_TYPE.GAME_TYPE, id: "one", data: move };
        const str = JSON.stringify(obj);
        const msg = new WSClientMessage(str);
        const resp = lobby.handleReq(msg);
        expect(resp).toEqual(ServerMessenger.MOVE_MADE);
    });
});