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

const FILE_SYSTEM = require ('fs');
const READ_LINE = require ('readline');

const TEMPLATE = {
    'SERVER_URL': {
        'message': 'Base URL for FiveM server e.g. http://127.0.0.1:3501',
        'required': true,
    },
    'BOT_LOG_LEVEL': {
        'message': 'Int of enum 0-4 Specifying level of logs to display with 4 as >= No Logs',
        'required': true,
        'default': 3,
    },
   'FIVEM_BOT_TOKEN': {
       'message': 'Discord bot token.',
       'required': true,
   },
   'BOT_CHANNEL_ID': {
       'message': 'Channel ID for the Channel you want updates to be pushed to.',
       'required': true,
   },
   'BOT_MESSAGE_ID': {
       'message': 'Message ID of the previous Update to edit.',
       'required': true,
       'default': null
   },
   'SERVER_SUGGESTION_CHANNEL': {
       'message': 'The channel to create Suggestion Embeds in.',
       'required': true,
   },
   'SERVER_BOG_REPORTS_CHANNEL': {
       'message': 'Channel to recieve Bug Reports.',
       'required': true,
   },
   'SERVER_BUG_LOG_CHANNEL': {
       'message': 'Channel to Log  Bug Reports.',
       'required': true,
   },
   'SERVER_BOT_LOGS': {
       'message': 'Channel to log Status Changes.',
       'required': true,
   },
};

const SAVE_FILE = './config.json';

function loadValue(key) {
    return new Promise((resolve, reject) => {
        const BotIntelligence = READ_LINE.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        BotIntelligence.question(`Please enter a value for '${key}'${TEMPLATE[key].required ? '' : ` (Not required defaults to '${TEMPLATE[key].default}')`}\n  ${TEMPLATE[key].message}\n> `, (value) => {
         BotIntelligence.close();
         resolve(value);
    });
  })
}

exports.createValues = function(keys) {
    return new Promise((resolve, reject) => {
      var data = {};
      if (keys === undefined) {
        keys = Object.keys(TEMPLATE);
      }
      const loop = function(i) {
        if (i < keys.length) {
          loadValue(keys[i]).then((value) => {
            let realValue = value.trim();
            if (TEMPLATE[keys[i]].required) {
              if (realValue.length > 0) {
                data[keys[i]] = realValue;
                loop(i + 1);
              } else {
                console.log('Invalid input');
                loop(i);
              }
            } else {
              if (realValue.length > 0) {
                data[keys[i]] = realValue;
                loop(i + 1);
              } else {
                data[keys[i]] = TEMPLATE[keys[i]].default;
                loop(i + 1);
              }
            }
          })
        } else {
          resolve(data);
        }
      }
      loop(0);
    })
  }

  exports.saveValues = function(values) {
      return new Promise((resolve, reject) => {
          FILE_SYSTEM.writeFile(SAVE_FILE, JSON.stringify(values), (err) => {
              if (err) return reject(err);
              return resolve(true);
          })
      })
  }

  exports.loadValues = function() {
    return new Promise((resolve,reject) => {
      fs.readFile(SAVE_FILE,(err,data) => {
        if (err) return reject(err);
        var json;
        try {
          json = JSON.parse(data);
        } catch(e) {
          console.log('Bad json in config.json');
          return reject(e);
        }
        let notFound = new Array();
        for (var key in TEMPLATE) {
          if (!json.hasOwnProperty(key)) {
            notFound.push(key);
          }
        }
        if (notFound.length === 0) {
          return resolve(json);
        } else {
          console.log('Some new configuration values have been added');
          exports.createValues(notFound).then((data) => {
            for (var key in data) {
              json[key] = data[key];
            }
            exports.saveValues(json).then(() => {
              resolve(json);
            }).catch(reject);
          }).catch(reject);
        }
      })
    });
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