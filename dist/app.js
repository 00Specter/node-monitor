"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const shelljs_1 = require("shelljs");
const bent_1 = __importDefault(require("bent"));
const bluebird_1 = require("bluebird");
const axios_1 = __importDefault(require("axios"));
function getHttpRequest(url) {
    return __awaiter(this, void 0, void 0, function* () {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = yield axios_1.default.get(url);
            return response;
        }
        catch (error) {
            throw error;
        }
    });
}
const post = (0, bent_1.default)('https://betteruptime.com/', 'json', 'POST', 201, {
    Content_Type: 'application/json',
    Authorization: `Bearer ${config_1.default.BETTERUPTIME_KEY}`,
});
const get = (0, bent_1.default)('https://betteruptime.com/', 'GET', 200);
class InitiaMonitor {
    constructor() {
        this.statusMap = new Map();
    }
    postIncident(name, summary, description) {
        return __awaiter(this, void 0, void 0, function* () {
            yield post('api/v2/incidents', {
                requester_email: 'specter@initia.co',
                name: name,
                summary,
                description,
                email: true,
                call: false,
                sms: false,
            });
        });
    }
    apiCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = config_1.default.API_ENDPOINT_URL + '/health';
                const res = yield getHttpRequest(url);
                if (res.status != 200) {
                    yield this.postIncident('api monitoring', 'api is not healthy', `api is not healthy with status code ${res.status}`);
                    return;
                }
                console.log("api ok");
            }
            catch (err) {
                console.error("apiCheck err");
            }
        });
    }
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            for (;;) {
                yield bluebird_1.Promise.all([
                    bluebird_1.Promise.delay(1 * 1000).then(this.nodeCheck),
                    bluebird_1.Promise.delay(1 * 1000).then(this.apiCheck),
                    bluebird_1.Promise.delay(1 * 1000).then(this.heartbeatCheck)
                ]);
            }
        });
    }
    nodeCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // node status check
                const res = (0, shelljs_1.exec)(config_1.default.STATUS_CHECK_CMD);
                if (res.code !== 0) {
                    yield this.postIncident('node monitoring', 'failed to execute status check script', `failed to execute status check script with \n
					code: ${res.code}, \n
					stderr: ${res.stderr} \n`);
                    yield bluebird_1.Promise.delay(5 * 60 * 1000); // sleep 5m
                    return;
                }
                // block sync check
                const resJSON = JSON.parse(res.stdout.toString());
                for (const key in resJSON) {
                    const height = Number.parseInt(resJSON[key]);
                    if (this.statusMap[key] === height) {
                        yield this.postIncident('node monitoring', 'block sync halted', `"${key}" block sync halted at the height "${height}"`);
                    }
                    this.statusMap[key] = height;
                }
                console.log("node ok");
            }
            catch (err) {
                console.error("nodeCheck err");
            }
        });
    }
    heartbeatCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            yield get(`api/v1/heartbeat/${config_1.default.HEARTBEAT_KEY}`);
        });
    }
}
const monitor = new InitiaMonitor();
monitor
    .check()
    .then(() => {
    console.info('program exits');
});
//# sourceMappingURL=app.js.map