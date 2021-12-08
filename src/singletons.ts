import Lobby from "./models/gameplay/Lobby";
import { RegistrationManager } from "./models/registration/RegistrationManager";
import { DBManager } from "./models/database/DBManager";

const lobby = new Lobby();
const registrar = new RegistrationManager();
const dbManager = new DBManager();

export { lobby };
export { registrar };
export { dbManager };
