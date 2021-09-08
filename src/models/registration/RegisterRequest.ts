export class RegisterRequest {
    id: string;
    ssid: string;
    valid: boolean;

    constructor(raw: string) {
        this.id = "";
        this.ssid = "";
        this.valid = false;

        try {
            const parse = JSON.parse(raw) as RegisterRequest;
            if (isInstance(parse)) {
                this.id = parse.id;
                this.ssid = parse.ssid;
            } else {
                this.valid = false;
            }
        } catch (err) {
            this.valid = false;
        }
    }

    toString() {
        return JSON.stringify(this);
    }
}
export function isInstance(object: any) {
    if ("id" in object && "ssid" in object) {
        return true;
    }
    return false;
}
