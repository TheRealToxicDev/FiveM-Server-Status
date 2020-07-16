/*
Copyright & Disclaimer:
* I DO NOT authorize you to sell, edit, modify and or Change this Bot, the corresponding code, or any attached Copyright Notices without my consent, 
* Violation of this term will result in a copyright strike and could affect your FiveM Server Negatively.
*
Information:
* If you fork, download or use this Project please ensure all Copyright Notices & Credits remain in place (Copyright Violation).
* Due to the Fact that no LICENSE File is provided with this bot DOES NOT mean you are free to Edit Any Copyright Notices or Credits without prior consent.
* If you would like to Contribute/Help with this project and have your name included in this project you can submit a pull request, I am alwasy open to changes.
*
Credits:
* Developer/Creator: ☣ Tσxιƈ Dҽʋ ☣#7308 (Discord)
*/

/*
 -- EDITING THIS FILE IS NOT NECESSARY PLEASE CONTACT ME FOR SUPPORT HERE || PLEASE ONLY EDIT THE CONFIG.JSON FILE --
 -- EDITING THIS FILE IS NOT NECESSARY PLEASE CONTACT ME FOR SUPPORT HERE || PLEASE ONLY EDIT THE CONFIG.JSON FILE --
 -- EDITING THIS FILE IS NOT NECESSARY PLEASE CONTACT ME FOR SUPPORT HERE || PLEASE ONLY EDIT THE CONFIG.JSON FILE --
 -- EDITING THIS FILE IS NOT NECESSARY PLEASE CONTACT ME FOR SUPPORT HERE || PLEASE ONLY EDIT THE CONFIG.JSON FILE --
*/

const Discord_Gateway = require ('discord.js');
const fetchTimeout = require ('fetch-timeout');
const { paddedFullWidth, errorWrap } = require ('./utils.js');

if (Discord_Gateway.version.startsWith('12')) {
    Discord.StatusEmbed = Discord_Gateway.MessageEmbed;
    Discord_Gateway.TextChannel.prototype.fetchMessage = function(snowflake) { // Not perfect but it will work for now :)
         return this.message.fetch.apply(this.messages,[snowflake]);
    }
    Object.defineProperty (Discord_Gateway.user.prototype,`displayAvatarURL`), {
        'get': function() {
            return this.avatarURL();
        }
    }
}

const SERVER_LOG_LEVELS = {
    'ERROR': 3,
    'INFO': 2,
    'DEBUG': 1,
    'SPAM': 0
}

const SERVER_BOT_CONFIG = {
    'apiRequestMethod': 'sequential',
    'messageCacheMaxSize': 50,
    'messageCacheLifetime': 0,
    'messageSweepInterval': 0,
    'fetchAllMembers': false,
    'disableEveryone': true,
    'sync': false,
    'restWsBridgeTimeout': 5000,
    'restTimeOffset': 300,
    'disabledEvents': [
        'CHANNEL_PINS_UPDATE',
        'TYPING_START'
    ],
    'ws': {
        'large_threshold': 100,
        'compress': true
    }
}

const CLIENT_USER_AGENT = `FiveM Status Bot ${require('./package.json').version} , Node ${process.version} (${process.platform}${process.arch})`; // Set Up the bots API Client.

exports.start = function(SETUP) {
    const FIVEM_SERVER_URL = SETUP.SERVER_URL;

    const FIVEM_PLAYERS_URL = new URL('/players.json',SETUP.FIVEM_SERVER_URL).toString(); // Used to fetch the Player List.
    const FIVEM_INFO_URL = new URL('/info.json',SETUP.FIVEM_SERVER_URL).toString(); // Used to fetch Server Status and Info.
    const MAX_PLAYERS = 32;
    const TICK_MAX = 1 << 9;
    const FETCH_TIMEOUT = 900;
    const FETCH_OPTIONS = {
        'cahce': 'no-cache',
        'method': 'GET',
        'headers': { 'User-Agent': USER_AGENT }
    };

    const BOT_LOG_LEVEL = SETUP.BOT_LOG_LEVEL !== undefined ? parseInt(SETUP.BOT_LOG_LEVEL) : BOT_LOG_LEVELS.INFO;
    const THIS_BOTS_TOKEN = SETUP.FIVEM_BOT_TOKEN;
    const DISCORD_CHANNEL_ID = SETUP.BOT_CHANNEL_ID;
    const DISCORD_MESSAGE_ID = SETUP.BOT_MESSAGE_ID;
    const BOT_SUGGESTION_CHANNEL = SETUP.SERVER_SUGGESTION_CHANNEL;
    const BOT_BUG_REPORTS = SETUP.SERVER_BUG_REPORTS_CHANNEL;
    const BOT_BUG_LOG_CHANNEL = SETUP.SERVER_BUG_LOG_CHANNEL;
    const BOT_LOGS_CHANNEL = SETUP.SERVER_BOT_LOGS;
    const BOT_STREAM_URL = SETUP.BOT_STREAM_URL;
    const BOT_STREAM_CHANNEL = SETUP.BOT_STREAM_CHANNEL;
    const UPDATE_TIME = 2500 // In MS (1000 = 1 Second)

    var TICK_NUMBER = 0;
    var MESSAGE;
    var LAST_COUNT;
    var STATUS;

    var STREAM_DISPATCHER = undefined;

    var loop_callbacks = []; // For testing whether "Loop" is still running

    const log = function(level, message) {
        if (level >= BOT_LOG_LEVEL) console.log(`${new Date().toLocaleString()} : ${level}: ${message}`);
    };

    const getPlayers = function() {
        return new Promise((resolve, reject) => {
            fetchTimeout(FIVEM_PLAYERS_URL, FETCH_OPTIONS, FETCH_TIMEOUT).then((res) => {
                res.json().then((players) => {
                    resolve(players);
                }).catch(reject);
            }).catch(reject);
        })
    };

    const getVars = function() {
        return new Promise((resolve, reject) => {
            fetchTimeout(FIVEM_INFO_URL, FETCH_OPTIONS, FETCH_TIMEOUT).then((res) => {
                res.json().then((info) => {
                    resolve(info.vars);
                }).catch(reject);   
            }).catch(reject);
        });
    };

    const THIS_GATEWAY_CLIENT = new Discord_Gateway.Client(SERVER_BOT_CONFIG);

    const sendOrUpdate = function(embed) {
        if (MESSAGE !== undefined) {
            MESSAGE.edit(embed).then(() => {
                log(SERVER_LOG_LEVELS.DEBUG, 'Updated Successfully');
            }).catch(() => {
                log(SERVER_LOG_LEVELS.ERROR, 'Update Failed, Please contact ☣ Tσxιƈ Dҽʋ ☣ on Discord.')
            })
        } else {
            let MESSAGE_CHANNEL = THIS_GATEWAY_CLIENT.channels.get(DISCORD_CHANNEL_ID);
            if (MESSAGE_CHANNEL !== undefined) {
                MESSAGE_CHANNEL.fetchMessage(DISCORD_MESSAGE_ID).then((message) => {
                    MESSAGE = message;
                    message.edit(embed).then(() => {
                        log(SERVER_LOG_LEVELS.SPAM, 'Updated Successfully');
                    }).catch(() => {
                        log(SERVER_LOG_LEVELS.ERROR, 'Update Failed, Please contact ☣ Tσxιƈ Dҽʋ ☣ on Discord.');
                    });
                }).catch(() => {
                    MESSAGE_CHANNEL.send(embed).then((message) => {
                        MESSAGE = message;
                        log(SERVER_LOG_LEVELS.INFO, `Sent message (${message.id})`);
                    }).catch(console.error);
                })
            } else {
                log(SERVER_LOG_LEVELS.ERROR, 'Update channel not set :(');
            }
        }
    };

    const UpdateEmbed = function() {
        let dot = TICK_NUMBER % 2 === 0 ? 'NSW' : 'Central Metro Roleplay';
        let embed = new Discord_Gateway.RichEmbed()
        .setAuthor('NSWCMRP Status', '')
        .setColor(0x2894C2)
        .setFooter(TICK_NUMBER % 2 === 0 ? 'NSW' : 'Central Metro RP')
        .setTimestamp(new Date())
        .addField('Interested in joinining the server?', '', false)
        if (STATUS !== undefined)
        {
        embed.addField(':warning: Current Server Status', `${STATUS}\n\u200b\n`)
        embed.setColor(0xFF5D00)
        }
        return embed;
    };

    const SERVER_OFFLINE = function() {
        log(SERVER_LOG_LEVELS.SPAM, Array.from(arguments));
        if (LAST_COUNT !== null) log(SERVER_LOG_LEVELS.INFO, `Server is Offline! ${FIVEM_SERVER_URL} (${FIVEM_PLAYERS_URL} ${FIVEM_INFO_URL})`);
        let embed = UpdateEmbed()
        .setColor(0xff0000)
        .addField('Server Status', ':x: Offline', true)
        .addField('Server Queue', '?', true)
        .addField('Online Players', '\n\u200b\n', true);
        sendOrUpdate(embed);
        LAST_COUNT = null;
    };

    const updateMessage = function() {
        getVars().then((vars) => {
            getPlayers().then((players) => {
                if (players.length !== LAST_COUNT) log(SERVER_LOG_LEVELS.INFO, `${players.length} Players0`);
                let queue = vars['Queue'];
                let embed = UpdateEmbed()
                .addField('Server Status', ':white_check_mark: Online', true)
                .addField('Server Queue', queue === 'Enabled' || queue === undefined ? '0' : queue.split(':')[1].trim(), true)
                .addField('Online Players', `${players.length}/${MAX_PLAYERS}\n\u200b\n`, true);
                if (players.length > 0) {
                    // Method D
                    const fieldCount = 3;
                    const fields = new Array(fieldCount);
                    fields.fill('');
                    
                    fields[0] = `**Inhabitants:**\n`;
                    for (var i = 0; i < players.length; i ++) {
                        fields[(i + 1) % fieldCount] += `${players[i].name.substr(0, 12)}\n`; // First 12 Characters of the players name.
                    } 
                }

                sendOrUpdate(embed);
                LAST_COUNT = players.length;
            }).catch(offline);
        }).catch(offline);
        TICK_NUMBER ++;
        if (TICK_NUMBER >= TICK_MAX) {
            TICK_NUMBER = 0;
        }
        for (var i = 0 ; i < loop_callbacks.length ; i ++) {
            let callback = loop_callbacks.pop(0);
        }
    };

    THIS_GATEWAY_CLIENT.on('ready', () => {
        log(SERVER_LOG_LEVELS.INFO, 'Okay, I am Online!!');
        THIS_GATEWAY_CLIENT.user.setActivity('NSW Central Metro RP', {'url':'https://www.twitch.tv/monstercat', 'type':'STREAMING'});
        THIS_GATEWAY_CLIENT.generateInvite(['ADMINISTRATOR']).then((link) => {
            log(SERVER_LOG_LEVELS.INFO, `Invite URL: ${link}`)
        }).catch(null);
        THIS_GATEWAY_CLIENT.setInterval(updateMessage, UPDATE_TIME); // Use Voice Broadcast for Multiple Channels.
    });

    function checkLoop() {
        return new Promise((resolve, reject) => {
            var resolved = false;
            let id = loop_callbacks.push(() => {
                if (!resolved) {
                    resolved = true;
                    resolve(true);
                } else {
                    log(SERVER_LOG_LEVELS.ERROR, 'Loop callback called after timeout');
                    reject(null);
                }
            })
            setTimeout(() => {
                if (!resolved) {
                    resolved = true; 
                    resolve(false)
                }
            }, 3000);
        })
    }

    THIS_GATEWAY_CLIENT.on('debug', (info) => {
        log(SERVER_LOG_LEVELS.SPAM, info);
    })

    THIS_GATEWAY_CLIENT.on('error', (error, shard) => {
        log(SERVER_LOG_LEVELS.ERROR, error);
    })

    THIS_GATEWAY_CLIENT.on('warn', (info) => {
        log(SERVER_LOG_LEVELS.DEBUG, info);
    })

    THIS_GATEWAY_CLIENT.on('disconnect', (devent, shard) => {
        log(SERVER_LOG_LEVELS.INFO, 'Disconnected');
        checkLoop().then((running) => {
            log(SERVER_LOG_LEVELS.INFO, `Loop is still running: ${running}`);
        }).catch(console.error);
    })

    THIS_GATEWAY_CLIENT.on('reconnecting', (shard) => {
        log(SERVER_LOG_LEVELS.INFO, 'Reconnecting');
        checkLoop().then((running) => {
            log(SERVER_LOG_LEVELS.INFO, `Loop is still running: ${running}`);
        }).catch(console.error);
    })

    THIS_GATEWAY_CLIENT.on('resume', (replayed, shard) => {
        log(SERVER_LOG_LEVELS.INFO, `Resuming (${replayed} events replayed)`);
        checkLoop().then((running) => {
            log(SERVER_LOG_LEVELS.INFO, `Loop is still running: ${running}`);
        }).catch(console.error);
    })

    THIS_GATEWAY_CLIENT.on('rateLimit', (info) => {
        log(SERVER_LOG_LEVELS.INFO, `Rate limit hit ${info.timeDifference ? info.timeDifference : info.timeout ? info.timeout : 'Unknown Timeout '}ms (${info.path} / ${info.requestLimit ? info.requestLimit : info.limit ? info.limit : 'Unknown Limit'})`);
        if (info.path.startsWith(`/channels/${DISCORD_CHANNEL_ID}/messages/${DISCORD_MESSAGE_ID ? DISCORD_MESSAGE_ID : MESSAGE ? MESSAGE.id : ''}`)) THIS_GATEWAY_CLIENT.emit('restart');
        checkLoop().then((running) => {
            log(SERVER_LOG_LEVELS.DEBUG, `Loop is still running: ${running}`)
        }).catch(console.error);
    })
    
    THIS_GATEWAY_CLIENT.on('message', async function (msg) {
        if (msg.channel.id === '') { // ID For the Channel you want the bot to be used in.
            await msg.react(THIS_GATEWAY_CLIENT.emojis.get('👌'))
            await msg.react(THIS_GATEWAY_CLIENT.emojis.get('👍'))
        }
    });

    THIS_GATEWAY_CLIENT.on('message', (message) => {
        if (!message.author.bot) {
            if (message.member) {
                if (message.member.hasPermission('ADMINISTRATOR')) {
                    if (message.content.startsWith('+status ')) {
                        let status = message.content.substr(7).trim();
                        let embed = new Discord_Gateway.RichEmbed()
                        .setAuthor(message.member.nickname ? message.member.nickname : message.author.tag, message.author.displayAvatarURL)
                        .setColor(0x2894C2)
                        .setTitle('Updated status message')
                        .setTimestamp(new Date());
                        if (status = 'clear') {
                            STATUS = status;
                            embed.setDescription(`New message:\n\`\`\`${STATUS}\`\`\``);
                        }
                        THIS_GATEWAY_CLIENT.channels.get(BOT_LOGS_CHANNEL).send(embed);
                        return log(SERVER_LOG_LEVELS.INFO, `${message.author.username} Updated status`);
                    }
                }
                if (message.channel.id === BOT_SUGGESTION_CHANNEL) {
                    let embed = new Discord_Gateway.RichEmbed()
                    .setAuthor(message.member.nickname ? message.member.nickname : message.author.tag, message.author.displayAvatarURL)
                    .setColor(0x2894C2)
                    .setTitle('Suggestions')
                    .setDescription(message.content)
                    .setTimestamp(new Date());
                    message.channel.send(embed).then((message) => {
                        const sent = message;
                        sent.react('👍').then(() => {
                        sent.react('👎').then(() => {
                            log(SERVER_LOG_LEVELS.SPAM, 'Completed suggestion message');
                    }).catch(console.error);
                }).catch(console.error);
            }).catch(console.error);
            return message.delete();
        }
        if (message.channel.id === BOT_BUG_REPORTS) {
            let embedUser = new Discord_Gateway.RichEmbed()
            .setAuthor(message.member.nickname ? message.member.nickname : message.author.tag, message.author.displayAvatarURL)
            .setColor(0x2894C2)
            .setTitle('Bug Report Sent')
            .setDescription('Thank you for Reporting the bug, Our Developers & Staff will look at it as soon as possible')
            .setTimestamp(new Date());
            let embedStaff = new Discord_Gateway.RichEmbed()
            .setAuthor(message.member.nickname ? message.member.nickname : message.author.tag, message.author.displayAvatarURL)
            .setColor(0x2894C2)
            .setTitle('New Bug Report')
            .setDescription(message.content)
            .setTimestamp(new Date())
            message.channel.send(embedUser).then(null).catch(console.error)
            THIS_GATEWAY_CLIENT.channels.get(BOT_BUG_LOG_CHANNEL).send(embedStaff).then(null).catch(console.error);
            return message.delete();
        }
      } 
     }
  });

  THIS_GATEWAY_CLIENT.login(THIS_BOTS_TOKEN).then(null).catch(() => {
      log(SERVER_LOG_LEVELS.ERROR, 'Unable to login, Please check the token or Contact my Developer');
      console.error(e);
      process.exit(1);
  });

  return THIS_GATEWAY_CLIENT;
}

/*
 -- EDITING THIS FILE IS NOT NECESSARY PLEASE CONTACT ME FOR SUPPORT HERE || PLEASE ONLY EDIT THE CONFIG.JSON FILE --
 -- EDITING THIS FILE IS NOT NECESSARY PLEASE CONTACT ME FOR SUPPORT HERE || PLEASE ONLY EDIT THE CONFIG.JSON FILE --
 -- EDITING THIS FILE IS NOT NECESSARY PLEASE CONTACT ME FOR SUPPORT HERE || PLEASE ONLY EDIT THE CONFIG.JSON FILE --
 -- EDITING THIS FILE IS NOT NECESSARY PLEASE CONTACT ME FOR SUPPORT HERE || PLEASE ONLY EDIT THE CONFIG.JSON FILE --
*/

/*
Copyright & Disclaimer:
* I DO NOT authorize you to sell, edit, modify and or Change this Bot, the corresponding code, or any attached Copyright Notices without my consent, 
* Violation of this term will result in a copyright strike and could affect your FiveM Server Negatively.
*
Information:
* If you fork, download or use this Project please ensure all Copyright Notices & Credits remain in place (Copyright Violation).
* Due to the Fact that no LICENSE File is provided with this bot DOES NOT mean you are free to Edit Any Copyright Notices or Credits without prior consent.
* If you would like to Contribute/Help with this project and have your name included in this project you can submit a pull request, I am alwasy open to changes.
* 
Credits:
* Developer/Creator: ☣ Tσxιƈ Dҽʋ ☣#7308 (Discord)
*/