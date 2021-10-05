// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const client = { username: username }; //ts throws error because username is located in connect page script tag

const game = new GameSocket(client.username);
