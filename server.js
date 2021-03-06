const fs = require('fs');
const path = require('path');
const util = require('util');
const logFile = fs.createWriteStream(path.join(__dirname, 'debug.log'), { flags: 'a', autoClose: true });

console.error = (msg, ...optionalParams) => {
    logFile.write(util.format(msg, ...optionalParams) + '\n');
    process.stderr.write(util.format(msg, ...optionalParams) + '\n');
};

console.warn = (msg, ...optionalParams) => {
    logFile.write(util.format(msg, ...optionalParams) + '\n');
    process.stdout.write(util.format(msg, ...optionalParams) + '\n');
};

console.info = (msg, ...optionalParams) => {
    logFile.write(util.format(msg, ...optionalParams) + '\n');
    process.stdout.write(util.format(msg, ...optionalParams) + '\n');
};

console.log = (msg, ...optionalParams) => {
    logFile.write(util.format(msg, ...optionalParams) + '\n');
    process.stdout.write(util.format(msg, ...optionalParams) + '\n');
};

console.debug = (msg, optionalParams) => {
    logFile.write(util.format(msg, ...optionalParams) + '\n');
    process.stdout.write(util.format(msg, ...optionalParams) + '\n');
};


const app = require('express')();
const server = require('http').Server(app);
const next = require('next');
var appState = require('./app_state.js');
const bodyParser = require('body-parser');
const backend = require('./daemon/index');

const dev = process.env.NODE_ENV !== 'production';
const dir = __dirname;
const nextApp = next({ dev, dir });
const handler = nextApp.getRequestHandler();

const PATH_TO_STATE = path.join(__dirname, 'state');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

nextApp.prepare().then(() => {
    app.get('/__ping', (req, res) => {
        res.send();
    });

    app.post('/__save', (req, res) => {
        appState.set(req.body);
        res.send();
    });

    app.post('/__close', (req, res) => {
        let appStates = appState.get();
        fs.writeFile(PATH_TO_STATE, JSON.stringify(appStates), function (err) {
            if (err) {
                res.status(500);
                res.send();
                console.log('Fail to write state');
            } else {
                res.send();
                server.close(() => {
                    console.log('Server closed');
                    process.exit(0);
                });
            }
        });
    });

    app.post('/__call', (req, res) => {
        let reqBody = req.body;
        let args = reqBody.args;
        let method = reqBody.method;
        let argc = Object.keys(args).length;
        let argsArray = [];

        for (let i = 0; i < argc; i++) {
            argsArray.push(args[i]);
        }

        const result = backend[method](...argsArray);
        res.send(result);
    });

    app.get('*', (req, res) => {
        req._appState = appState.get()._appState;
        req._platformState = appState.get()._platformState;
        handler(req, res);
    });

    server.on('error', (error) => {
        if (typeof process.send === 'function') {
            process.send({ msg: "server_error", error });
        }
        console.error(error);
        throw error;
    });

    server.listen(0, err => {
        if (typeof process.send === 'function') {
            // For Electron
            process.send({ msg: "listening", server: server.address() });
        } else {
            // For Android platform
            let obj = { time: (new Date().getTime()), server: server.address() }
            fs.writeFile(
                path.join(__dirname, 'SERVER'),
                JSON.stringify(obj),
                (err) => { }
            );
        }
        if (err) throw err;
        console.log(`> Ready on http://localhost:${server.address().port}`);
    });
});

fs.exists(PATH_TO_STATE, (exists) => {
    if (exists) {
        fs.readFile(PATH_TO_STATE, (err, state) => {
            if (err) throw err;
            appState.set(JSON.parse(state));
        });
    }
});
