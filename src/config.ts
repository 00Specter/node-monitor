import dotenv from 'dotenv';

dotenv.config();

function checkEnvVar(variableName): string {
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
	BETTERUPTIME_KEY : BETTERUPTIME_KEY,
	STATUS_CHECK_CMD: STATUS_CHECK_CMD,
	HEARTBEAT_KEY : HEARTBEAT_KEY,
	API_ENDPOINT_URL : API_ENDPOINT_URL
};

export default config;
