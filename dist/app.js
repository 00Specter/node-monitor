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
const express_1 = __importDefault(require("express"));
const shelljs_1 = require("shelljs");
const bent_1 = __importDefault(require("bent"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const statusCheckCmd = process.env.STATUS_CHECK_CMD || 'sh ./check_status.sh 4';
const API_KEY = process.env.API_KEY || 'bnP8e99RkD6Mz7kuM5JVfEtn';
const post = (0, bent_1.default)('https://betteruptime.com/', 'json', 'POST', 200, {
    Content_Type: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
});
class InitiaMonitor {
    constructor() {
        this.statusMap = new Map();
    }
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = (0, shelljs_1.exec)(statusCheckCmd);
            if (res.code !== 0) {
                yield post('api/v2/incidents', {
                    name: 'node monitoring',
                    summary: 'failed to execute status check script',
                    description: `failed to execute status check script with code ${res.code}`,
                    email: true,
                    call: false,
                    sms: false,
                });
                return;
            }
            const resStr = res.stdout.toString();
            console.log(resStr);
            // post("api/v2/incidents", {
            //   name: "node monitoring",
            //   summary: "failed to execute status check script",
            //   description: `failed to execute status check script with code: ${res.code}`,
            //   email: true,
            //   call: false,
            //   sms: false,
            // });
        });
    }
}
app.get('/health', (req, res) => {
    res.json({ health: true });
});
app.listen(port, () => {
    return console.log(`Listening at http://0.0.0.0:${port}`);
});
const monitor = new InitiaMonitor();
monitor
    .check()
    .then(() => {
    console.info('program exits');
})
    .catch((err) => {
    console.error(err);
});
//# sourceMappingURL=app.js.map