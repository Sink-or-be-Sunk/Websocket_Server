import Lobby from "../../src/models/gameplay/Lobby";
import { Move, MOVE_RESULT, MOVE_TYPE } from "../../src/models/gameplay/Move";
import { GAME_TYPE, ResponseHeader } from "../../src/models/gameplay/Game";
import { WSClientMessage, REQ_TYPE } from "../../src/util/WSClientMessage"
import { Position, LAYOUT_TYPE } from "../../src/models/gameplay/Layout";
import { SERVER_HEADERS, WSServerMessage } from "../../src/util/WSServerMessage";

describe("Handle Lobby Requests ", () => {
    const lobby = new Lobby();

    it("Accepts New Game Request", () => {
        const obj = { req: REQ_TYPE.NEW_GAME, id: "one" };
        const msg = new WSClientMessage(JSON.stringify(obj));
        const resp = lobby.handleReq(msg);
        const result = [new WSServerMessage({ header: SERVER_HEADERS.GAME_CREATED, at: obj.id })];
        expect(resp.toString()).toEqual(result.toString());
    });

    it("Accept Join Game Request", () => {
        const obj = { req: REQ_TYPE.JOIN_GAME, id: "two", data: "one" };
        const msg = new WSClientMessage(JSON.stringify(obj));
        const resp = lobby.handleReq(msg);
        const result = [new WSServerMessage({ header: SERVER_HEADERS.JOINED_GAME, at: obj.id, meta: obj.data })];
        expect(resp.toString()).toEqual(result.toString());
    });

    it("Reject Join Game Request from Player One already in game", () => {
        const obj = { req: REQ_TYPE.JOIN_GAME, id: "one", data: "one" };
        const msg = new WSClientMessage(JSON.stringify(obj));
        const resp = lobby.handleReq(msg);
        const result = [new WSServerMessage({ header: SERVER_HEADERS.INVALID_JOIN, at: obj.id, meta: ResponseHeader.ALREADY_IN_GAME })];
        expect(resp.toString()).toEqual(result.toString());
    });
    it("Reject Join Game Request from Player Two already in game", () => {
        const obj = { req: REQ_TYPE.JOIN_GAME, id: "two", data: "one" };
        const msg = new WSClientMessage(JSON.stringify(obj));
        const resp = lobby.handleReq(msg);
        const result = [new WSServerMessage({ header: SERVER_HEADERS.INVALID_JOIN, at: obj.id, meta: ResponseHeader.ALREADY_IN_GAME })];
        expect(resp.toString()).toEqual(result.toString());
    });

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
        const result = [new WSServerMessage({ header: SERVER_HEADERS.POSITIONED_SHIPS, at: obj.id })];
        expect(resp.toString()).toEqual(result.toString());
    });

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
        const result = [new WSServerMessage({ header: SERVER_HEADERS.POSITIONED_SHIPS, at: obj.id })];
        expect(resp.toString()).toEqual(result.toString());
    });

    it("Allow Player 1 to make a move", () => {
        const move = {
            type: MOVE_TYPE.SOLO,
            c: 0,
            r: 0,
            from: "one",
            to: "two",
        };
        const move_res = new Move(move);
        move_res.result = MOVE_RESULT.HIT;
        const obj = { req: REQ_TYPE.MAKE_MOVE, id: move.from, data: move };
        const str = JSON.stringify(obj);
        const msg = new WSClientMessage(str);
        const responses = lobby.handleReq(msg);
        const results = [
            new WSServerMessage({ header: SERVER_HEADERS.MOVE_MADE, at: move.from, payload: move_res }),
            new WSServerMessage({ header: SERVER_HEADERS.MOVE_MADE, at: move.to, payload: move_res }),
        ];
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const resp = responses[i];
            expect(resp).toEqual(result);
        }
    });
});


//     it("Allow Player 1 to make a move", () => {
//         const move = {
//             type: MOVE_TYPE.SOLO,
//             c: 0,
//             r: 0,
//             at: "two",
//         };
//         const obj = { req: REQ_TYPE.MAKE_MOVE, id: "one", data: move };
//         const str = JSON.stringify(obj);
//         const msg = new WSClientMessage(str);
//         const resp = lobby.handleReq(msg);
//         expect(resp).toEqual(ServerMessenger.MOVE_MADE);
//     });

//     it("Allow Player 2 to make a move", () => {
//         const move = {
//             type: MOVE_TYPE.SOLO,
//             c: 0,
//             r: 0,
//             at: "one",
//         };
//         const obj = { req: REQ_TYPE.MAKE_MOVE, id: "two", data: move };
//         const str = JSON.stringify(obj);
//         const msg = new WSClientMessage(str);
//         const resp = lobby.handleReq(msg);
//         expect(resp).toEqual(ServerMessenger.MOVE_MADE);
//     });
// });

// describe("Basic Matchmaking", () => {
//     // initialize a simple http server
//     const lobby = new Lobby();

//     it("Player 1 Creates New Basic Game", () => {
//         const req = {
//             id: "one",
//             req: REQ_TYPE.NEW_GAME,
//             data: GAME_TYPE.BASIC,
//         };
//         const msg = new WSClientMessage(JSON.stringify(req));
//         const resp = lobby.handleReq(msg);
//         expect(resp).toStrictEqual(ServerMessenger.GAME_CREATED);
//     });

//     it("Player 2 Joins the Game", () => {
//         const req = {
//             id: "two",
//             req: REQ_TYPE.JOIN_GAME,
//             data: "one",
//         };
//         const msg = new WSClientMessage(JSON.stringify(req));
//         const resp = lobby.handleReq(msg);
//         expect(resp).toStrictEqual(ServerMessenger.joined(req.data));
//     });

//     it("Allow Player 1 to position ships vertical", () => {
//         const pos0 = new Position(0, 0, LAYOUT_TYPE.PATROL);
//         const pos1 = new Position(0, 1, LAYOUT_TYPE.PATROL);
//         const pos2 = new Position(1, 0, LAYOUT_TYPE.DESTROYER);
//         const pos3 = new Position(1, 2, LAYOUT_TYPE.DESTROYER);
//         const list = [pos2, pos1, pos0, pos3];
//         const req = {
//             id: "one",
//             req: REQ_TYPE.POSITION_SHIPS,
//             data: list,
//         };
//         const msg = new WSClientMessage(JSON.stringify(req));
//         const resp = lobby.handleReq(msg);
//         expect(resp).toEqual(ServerMessenger.LAYOUT_APPROVED);
//     });

//     it("Allow Player 1 to position ships vertical", () => {
//         const pos0 = new Position(0, 0, LAYOUT_TYPE.PATROL);
//         const pos1 = new Position(0, 1, LAYOUT_TYPE.PATROL);
//         const pos2 = new Position(1, 0, LAYOUT_TYPE.DESTROYER);
//         const pos3 = new Position(1, 2, LAYOUT_TYPE.DESTROYER);
//         const list = [pos2, pos1, pos0, pos3];
//         const req = {
//             id: "two",
//             req: REQ_TYPE.POSITION_SHIPS,
//             data: list,
//         };
//         const msg = new WSClientMessage(JSON.stringify(req));
//         const resp = lobby.handleReq(msg);
//         expect(resp).toEqual(ServerMessenger.LAYOUT_APPROVED);
//     });

//     it("Player 1 Makes a Move", () => {
//         const req = {
//             id: "one",
//             req: REQ_TYPE.MAKE_MOVE,
//             data: {
//                 c: 0,
//                 r: 0,
//                 type: MOVE_TYPE.SOLO,
//                 at: "two",
//             },
//         };
//         const msg = new WSClientMessage(JSON.stringify(req));
//         const resp = lobby.handleReq(msg);
//         expect(resp).toStrictEqual(ServerMessenger.MOVE_MADE);
//     });

//     it("Player 2 Makes a Move", () => {
//         const req = {
//             id: "two",
//             req: REQ_TYPE.MAKE_MOVE,
//             data: {
//                 c: 1,
//                 r: 2,
//                 type: MOVE_TYPE.SOLO,
//                 at: "one",
//             },
//         };
//         const msg = new WSClientMessage(JSON.stringify(req));
//         const resp = lobby.handleReq(msg);
//         expect(resp).toStrictEqual(ServerMessenger.MOVE_MADE);
//     });

//     it("Player 2 Tries to Make Move when its Player 1's Turn", () => {
//         const req = {
//             id: "two",
//             req: REQ_TYPE.MAKE_MOVE,
//             data: {
//                 c: 3,
//                 r: 2,
//                 type: MOVE_TYPE.SOLO,
//                 at: "one",
//             },
//         };
//         const msg = new WSClientMessage(JSON.stringify(req));
//         const resp = lobby.handleReq(msg);
//         expect(resp).toStrictEqual(
//             ServerMessenger.invalid_move(ResponseHeader.TURN_ERROR),
//         );
//     });
// });
