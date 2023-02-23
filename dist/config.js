"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function checkEnvVar(variableName) {
    const value = process.env[variableName];
    if (!value) {
        console.error(`\`${variableName}\` env is not set properly`);
        process.exit(-1);
    }
    return value;
}
const BETTERUPTIME_KEY = checkEnvVar('BETTERUPTIME_KEY');
const HEARTBEAT_KEY = checkEnvVar('HEARTBEAT_KEY');
const API_ENDPOINT_URL = checkEnvVar('API_ENDPOINT_URL');
const STATUS_CHECK_CMD = checkEnvVar('STATUS_CHECK_CMD');
const config = {
    BETTERUPTIME_KEY: BETTERUPTIME_KEY,
    STATUS_CHECK_CMD: STATUS_CHECK_CMD,
    HEARTBEAT_KEY: HEARTBEAT_KEY,
    API_ENDPOINT_URL: API_ENDPOINT_URL
};
exports.default = config;
//# sourceMappingURL=config.js.map