# node-monitor

Simple initia node Monitoring Tool for Better Uptime.


## Setup
```
cp ./.env_example ./.env

# fill API_KEY with STATUS_CHECK_CMD
nano ./.env
```

| Name            | Description                                            | Default                          |
| --------------- | ------------------------------------------------------ | -------------------------------- |
| BETTERUPTIME_KEY| BetterUpTime API key                                   |                                  |
| HEARTBEAT_KEY   | BetterUpTime Heartbeat key                             |                                  |
| STATUS_CHECK_CMD| Node status check command                              |                                  |
| API_ENDPOINT_URL| Initia API endpoint                                    |                                  |


## How to run
```
npm start
```

