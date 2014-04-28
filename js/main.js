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
var $ = require('jquery');

function random32hexString() {
    var text = "";

    var charset = "abcdef0123456789";

    for (var i = 0; i < 32; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}

function end() {
    return '\0';
}

function DuelingNetworkConnection(username, password) {
    var parameters = {
        url: 'http://duelingnetwork.com/',
        domain: 'duelingnetwork.com',
        logined: 'http://www.duelingnetwork.com:8080/Dueling_Network/logged_in.do',
        login: 'http://duel.duelingnetwork.com:8080/Dueling_Network/login.do',
        port: '1234'
    };

    if (false) {
        request.post('http://duel.duelingnetwork.com:8080/Dueling_Network/login.do', {
            form: {
                username: username,
                password: password,
                remember_me: 'true',
                dn_id: 'fffffffffffffffffffff'
            }
        }, function (one, two, three) {
            console.log(three);
        });

    }
    if (true) {

    }


}
prompt.start();
//prompt.get(['username', 'password'], function (err, result) {
//    //
//    // Log the results.
//    //
//    console.log('Command-line input received:');
//    console.log('  username: ' + result.username);
//    console.log('  password: ' + result.password);
//    DuelingNetworkConnection(result.username, result.password);
//});
http.createServer(function (req, res) {
    if (req.method == 'POST') {
        console.log("[200] " + req.method + " to " + req.url);
        var fullBody = '';

        req.on('data', function (chunk) {
            // append the current chunk of data to the fullBody variable
            fullBody += chunk.toString();
        });

        req.on('end', function () {

            // request ended -> do something with the data
            res.writeHead(200, "OK", {
                'Content-Type': 'text/html'
            });

            // parse the received body data
            console.log(':::::', fullBody);
            //var decodedBody = querystring.parse(fullBody);

            // output the decoded data to the HTTP response          
            res.write('<html><head><title>Post data</title></head><body><pre>');
            //res.write(utils.inspect(decodedBody));
            res.write('</pre></body></html>');

            res.end();
        });

    } else {
        console.log("[405] " + req.method + " to " + req.url);
        res.writeHead(405, "Method not supported", {
            'Content-Type': 'text/html'
        });
        res.end('<html><head><title>405 - Method not supported</title></head><body><h1>Method not supported.</h1></body></html>');
    }
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
prompt.get(['username', 'session'], function (err, result) {
    //
    // Log the results.
    //
    console.log('Command-line input received:');
    console.log('  username: ' + result.username);
    console.log('  session: ' + result.session);
    DuelingNetwork(result.username, result.session);
});

function DuelingNetwork(username, session) {
    var net = require('net');
    var sessionid = random32hexString();
    var client = new net.Socket();
    var version = 'Connect19';
    var bufferBank = '';


    client.connect(1234, 'duelingnetwork.com', function () {


        function heartbeat() {
            setInterval(function () {
                client.write('Heartbeat\0');
            }, 28000);
        }
        var datastring = version + ',' + username + ',' + session + ',' + sessionid + '\0';
        var message = new Buffer(datastring, 'utf-8');
        console.log(datastring);
        client.write(message);
        heartbeat();



    });

    client.on('data', function (data) {
        bufferBank = bufferBank + data;
        var nullcheck = [];
        if (bufferBank.indexOf('\0') !== -1) {
            nullcheck = bufferBank.split('\0');
            //console.log(nullcheck.length);
        }

        if (nullcheck.length > 1) {
            for (var i = 0; nullcheck.length - 1 > i; i++) {
                processDNMessage(version, client, nullcheck[i]);
            }
            bufferBank = nullcheck[nullcheck.length - 1];
        }

        //console.log('DN:: ' + data);

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