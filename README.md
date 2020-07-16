# FiveM Server Status Discord Bot

A custom discord bot providing functionality for interacting with fiveM servers and a discord community.

---

## Project Navigation
- [Install Instructions](http://help.toxicdev.me/docs/instructions/fivemserverstatus)
- [GitHub Repository](https://github.com/TheRealToxicDev/FiveM-Server-Status)

---
## Requirements
I have added a custom Queue Script that will change the queue count in the vars so it will update accurate.
Please make sure you add and append the "fivem_queue" script proivided in your Server Resources

---

## Setup Example 
- 1) Add the included fivem_queue to your server resources
- 2) Start the fivem_queue in your server.cfg
- 3) Set enviroment variables as described below

```jsx harmony
URL_SERVER - base url for fiveM server e.g. http://127.0.0.1:3501 (don't end with /)
LOG_LEVEL - Int of enum 0-4 specifying level of logs to display with 4 as no logs
BOT_TOKEN - Discord bot token
CHANNEL_ID - channel id for updates to be pushed to
MESSAGE_ID - message id of previous update to edit (not required)
SUGGESTION_CHANNEL - channel to create suggestion embeds in
BUG_CHANNEL - channel to recieve bug reports
BUG_LOG_CHANNEL - channel to log bug reports
LOG_CHANNEL - channel to log status changes
```

---

## Credits
- [Toxic Dev](https://github.com/TheRealToxicDev)

## Contact Options
- [Twitter](https://twitter.com/TheRealToxicDev)
- Discord - ☣ Tσxιƈ Dҽʋ ☣#7308
- Email - toxic.dev09@gmail.com


