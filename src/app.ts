import dotenv from 'dotenv';
import express from 'express';
import { exec } from 'shelljs';
import bent from 'bent';
import { Promise as P } from 'bluebird';

dotenv.config();

const app = express();
const port = Number.parseInt(process.env.PORT || '3000');
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
		for(;;) {
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
    
			await P.delay(30_000);
		}
	}
}

app.get('/health', (_req, res) => {
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
	.catch(async (err) => {
		console.error(err, await err.text());
	});
