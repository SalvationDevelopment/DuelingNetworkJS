/* jslint browser : true */
/* jslint node : true */
var usersOnline = {};

var application = false;
if (require) {
    application = true;
    try {
        require('httpsys').slipStream();
    } catch (error) {
        console.log('Windows 8+ spefic enhancements not enabled.');
    } finally {
        var http = require('http');
        var https = require('https');
        var ws = require('ws');
        var net = require('net');
        var request = require('request');
        var prompt = require('prompt');
    }
}


function randomHex(length) {
    var text = "";
    var charset = "abcdef0123456789";
    for (var i = 0; i < length; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
}

function login() {
    var username = '';
    var password = '';
    var parameters = {
        url: 'http://duelingnetwork.com/',
        domain: 'duelingnetwork.com',
        logined: 'http://www.duelingnetwork.com:8080/Dueling_Network/logged_in.do',
        login: 'http://duel.duelingnetwork.com:8080/Dueling_Network/login.do',
        port: '1234'
    };

    var poster = {
        username: username,
        password: password,
        remember_me: 'true',
        dn_id: 'fffffffffffffffffffff'
    };
}

function DuelingNetwork(username, serverSession) {

    var clientSession = randomHex(32);
    var client = new net.Socket();
    var version = 'Connect19';
    var bufferBank = '';
    var heartbeatControl;

    function heartbeat() {
        heartbeatControl = setInterval(function () {
            client.write('Heartbeat\0');
        }, 28000);
    }

    client.connect(1234, 'duelingnetwork.com', function () {

        var datastring = version + ',' + username + ',' + serverSession + ',' + clientSession + '\0';
        var message = new Buffer(datastring, 'utf-8');
        client.write(message);
        heartbeat();
    });

    client.on('data', function (data) {
        bufferBank = bufferBank + data;
        var nullcheck = [];
        if (bufferBank.indexOf('\0') !== -1) {
            nullcheck = bufferBank.split('\0');
        }

        if (nullcheck.length > 1) {
            for (var i = 0; nullcheck.length - 1 > i; i++) {
                processDNMessage(version, client, nullcheck[i]);
            }
            bufferBank = nullcheck[nullcheck.length - 1];
        }
    });

    client.on('close', function () {
        console.log('Connection closed');
    });
}

function processDNMessage(version, client, data) {
    function speak() {
        //        prompt.get(['message'], function (error, result) {
        //            client.write(version + ',Global message' + result.message);
        //        });
    }
    var command = '' + data;
    command.replace('\\,', ';');
    command = command.split(',');
    switch (command[0]) {
    case 'Online users':
        {
            usersOnline[command[1]] = command[2] || false;
            //console.log('+');
            break;
        }
    case 'Offline users':
        {
            delete usersOnline[command[1]];
            //console.log('-');
            break;
        }
    case 'Global message':
        {
            console.log('[' + command[1] + ']: ' + command[2]);
            break;
        }
    case 'Heartbeat':
        {
            break;
        }
    case 'Chat unlock':
        {
            speak();
            break;
        }
    default:
        {
            console.log('DN:: ' + data);
        }

    }
}