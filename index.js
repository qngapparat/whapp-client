const crypto = require('crypto');
const WebSocket = require('ws');

// connect to some Whatsapp server
const ws = new WebSocket(`wss://web.whatsapp.com/ws`, {
  perMessageDeflate: false,
  origin: 'https://web.whatsapp.com'
})

// create clientID (random 16 bytes, base64 encoded)
const clientId = crypto.randomBytes(16).toString('base64')
console.log(clientId);

// create tag (random number)
const tag = ~~(new Date().getTime() / 1000);
console.log(tag)


ws.on('open', () => {
  console.log("sending...")
  ws.send(`${ tag },["admin","init",[0,3,2390],["Long browser description","ShortBrowserDesc"],"${clientId }",true]`);
})

// incoming
ws.on('message', (data) => {
  console.log(data);
})