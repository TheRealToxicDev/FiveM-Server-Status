const padChar = ' '

exports.fullWidth = function(text) {
    var full = '';
    for (var i = 0; i < text.length; i ++) {
        let code = text.charCodeAt(i);
        if (code == 32) {
            full += padChar;
        } else if (code >= 33 && code <= 126) {
            full += String.fromCharCode(code+0xfee0); // Full width conersion
        }
    }
    return full;
}

