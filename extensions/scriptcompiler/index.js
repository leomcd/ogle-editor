const fs = require('fs');
const process = require('process');
const WS = require('websocket').w3cwebsocket;
const { v4: uuidv4 } = require('uuid');
const chalk = import('chalk');

const logPath = __dirname + "/log.txt";
fs.writeFileSync(logPath, "");
function loglog(d, convertToJson = false) {
  if (convertToJson) fs.appendFileSync(logPath, JSON.stringify(d,null,2) + "\n");
  else fs.appendFileSync(logPath, d+"\n");
}

// Obtain required params to start a WS connection from stdIn.
const processInput = JSON.parse(fs.readFileSync(process.stdin.fd, 'utf-8'));

const NL_PORT = processInput.nlPort;
const NL_TOKEN = processInput.nlToken;
const NL_CTOKEN = processInput.nlConnectToken;
const NL_EXTID = processInput.nlExtensionId;

const client = new WS(
  `ws://127.0.0.1:${NL_PORT}?extensionId=${NL_EXTID}&connectToken=${NL_CTOKEN}`
);

client.onerror = (error) => loglog(error, true);
client.onopen = () => loglog("Opened!");
client.onclose = () => { loglog("Closed!"); process.exit(); };

function sendToApp(data) {
  client.send(JSON.stringify({
    id: uuidv4(),
    method: "app.broadcast",
    accessToken: NL_TOKEN,
    data: { event: "fromCompiler", data }
  }));
}

client.onmessage = (e) => {
  const { event, data } = JSON.parse(e.data);

  if (event === "toCompiler") {
    loglog("Received toCompiler event!");
    toCompiler(data);
  } else if (["windowClose", "appClose"].includes(event)) client.onclose();
};

function log(message, type = "INFO") {
  const logLine = `[${NL_EXTID}]: ${chalk[
    type === "INFO" ? "green" : "red"
  ](type)} ${message}`;
  console[type === "INFO" ? "log" : "error"](logLine);
}

function toCompiler(data) {
  const { filesToRecompile } = data;

  loglog(filesToRecompile, true);

  setTimeout(() => {sendToApp({successfulRecompile: true})}, 1000)
}