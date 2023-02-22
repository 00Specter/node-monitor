import dotenv from 'dotenv';
import { exec } from 'shelljs';
import bent from 'bent';
import { Promise as P } from 'bluebird';

dotenv.config();

const statusCheckCmd = process.env.STATUS_CHECK_CMD || '';
if (statusCheckCmd.length === 0) {
	console.error('`STATUS_CHECK_CMD` env is not set properly');
	process.exit(-1);
}

const API_KEY = process.env.API_KEY || '';
if (API_KEY.length === 0) {
	console.error('`API_KEY` env is not set properly');
	process.exit(-1);
}

const HEARTBEAT_KEY = process.env.HEARTBEAT_KEY || '';
if (HEARTBEAT_KEY.length === 0) {
	console.error('`HEARTBEAT_KEY` env is not set properly');
	process.exit(-1);
}

const post = bent('https://betteruptime.com/', 'json', 'POST', 201, {
	Content_Type: 'application/json',
	Authorization: `Bearer ${API_KEY}`,
});

class InitiaMonitor {
	statusMap: Map<string, number>;

	constructor() {
		this.statusMap = new Map();
	}

	async check() {
		for (;;) {
			const res = exec(statusCheckCmd);
			if (res.code !== 0) {
				await post('api/v2/incidents', {
					requester_email: 'monitoring@initia.co',
					name: 'node monitoring',
					summary: 'failed to execute status check script',
					description: `failed to execute status check script with \n
                    code: ${res.code}, \n 
                    stderr: ${res.stderr} \n`,
					email: true,
					call: false,
					sms: false,
				});

				await P.delay(5 * 60 * 1_000); // sleep 5m
				return;
			}

			const resJSON = JSON.parse(res.stdout.toString());
			for (const key in resJSON) {
				const height = Number.parseInt(resJSON[key]);
				if (this.statusMap[key] === height) {
					await post('api/v2/incidents', {
						requester_email: 'monitoring@initia.co',
						name: 'node monitoring',
						summary: 'block sync halted',
						description: `"${key}" block sync halted at the height "${height}"`,
						email: true,
						call: false,
						sms: false,
					});
				}

				this.statusMap[key] = height;
			}

			await post(`api/v1/heartbeat/${HEARTBEAT_KEY}`);
			await P.delay(30 * 1000); // sleep 30s
		}
	}
}

const monitor = new InitiaMonitor();
monitor
	.check()
	.then(() => {
		console.info('program exits');
	})
	.catch(async (err) => {
		console.error(err, await err.text());
	});
