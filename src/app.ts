import config from './config';
import { exec } from 'shelljs';
import bent from 'bent';
import { Promise as P } from 'bluebird';
import axios, { AxiosResponse } from 'axios';


async function getHttpRequest(url: string): Promise<AxiosResponse> {
	// eslint-disable-next-line no-useless-catch
	try {
		const response = await axios.get(url);
		return response;
	} catch (error) {
		throw error;
	}
}

const post = bent('https://betteruptime.com/', 'json', 'POST', 201, {
	Content_Type: 'application/json',
	Authorization: `Bearer ${config.BETTERUPTIME_KEY}`,
});

const get = bent('https://betteruptime.com/', 'GET', 200);

class InitiaMonitor {
	statusMap: Map<string, number>;

	constructor() {
		this.statusMap = new Map();
	}
	async postIncident(name, summary, description) {
		await post('api/v2/incidents', {
			requester_email: 'specter@initia.co',
			name: name,
			summary,
			description,
			email: true,
			call: false,
			sms: false,
		});
	}
	async apiCheck(){
		try {
			const url =  config.API_ENDPOINT_URL +'/health';
			const res = await getHttpRequest(url);
			if (res.status != 200){
				await this.postIncident('api monitoring', 'api is not healthy', `api is not healthy with status code ${res.status}`);
				return;
			}
			console.log("api ok")
		} catch (err) {
			console.error("apiCheck err");
		}
		
	}

	async check() {
		for (;;){
			await P.all([
				P.delay(1 * 1000).then(this.nodeCheck),
				P.delay(1 * 1000).then(this.apiCheck),
				P.delay(1 * 1000).then(this.heartbeatCheck)
			]);
		}
	}
	async nodeCheck() {
		try {
			// node status check
			const res = exec(config.STATUS_CHECK_CMD);
			if (res.code !== 0) {
				await this.postIncident('node monitoring', 'failed to execute status check script', `failed to execute status check script with \n
					code: ${res.code}, \n
					stderr: ${res.stderr} \n`);
				await P.delay(5 * 60 * 1_000); // sleep 5m
				return;
			}

			// block sync check
			const resJSON = JSON.parse(res.stdout.toString());
			for (const key in resJSON) {
				const height = Number.parseInt(resJSON[key]);
				if (this.statusMap[key] === height) {
					await this.postIncident('node monitoring', 'block sync halted', `"${key}" block sync halted at the height "${height}"`);
				}

				this.statusMap[key] = height;
			}

			console.log("node ok")
		} catch (err) {
			console.error("nodeCheck err");
		}
		
	}
	async heartbeatCheck() {
		await get(`api/v1/heartbeat/${config.HEARTBEAT_KEY}`);
	}
}

const monitor = new InitiaMonitor();
monitor
	.check()
	.then(() => {
		console.info('program exits');
	});

