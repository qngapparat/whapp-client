const crypto = require('crypto');
const WebSocket = require('ws');
const ec = new (require('elliptic').ec)('curve25519');
const qrcode = require('qrcode');
const hkdf = require('@aws-crypto/hkdf-node')

const clientId = crypto.randomBytes(16).toString('base64')
const tag = ~~(new Date().getTime() / 1000);
const A = ec.genKeyPair();
const sec25519 = A.getPrivate()
const pub25519 = A.getPublic().encode('array');
const pub25519Base64 = Buffer.from(pub25519).toString("base64")
let i = 1;

// connect to Whatsapp server
const ws = new WebSocket(`wss://web.whatsapp.com/ws`, {
  perMessageDeflate: false,
  origin: 'https://web.whatsapp.com'
})

ws.on('open', () => {
  console.log("sending first req...")
  ws.send(`${tag},["admin","init",[0,3,2390],["Long browser description","ShortBrowserDesc"],"${clientId}",true]`);
})


//////////////////////////////////////////
//     Create login QR Code from data   //
//////////////////////////////////////////
function handleFirstResponse(data){
  // ensure HTTP 200
  if (data.match(/"status"\s?:\s?200,/) === false) {
    console.log(`Whapp did not 200: ${data}`);
    return
  }
  // Extract serverId
  let serverId = /\"ref\"\s?:\s?\"(.*?)\"/.exec(data)[0];
  serverId = serverId.split(':')[1].replace(/"/g, '');
  // create QR code
  const qrString = serverId + ',' + pub25519Base64 + ',' + clientId;
  qrcode.toString(qrString, { type: 'terminal' }, (err, url) => {
    console.log(url);
  })
}

function handleLoggedInResponse(data){
  console.log(data);
  
  console.log(secret);
  
}

// // incoming
// ws.on('message', (data) => {
  
//   //////////////////////////////////
//   //    Handle first response
//   //////////////////////////////////
//   if (i == 1) {
//     handleFirstResponse(data);
//     i++;
//   }
  
//   else {
//     handleLoggedInResponse(data);
//   }
  
// })

const ex = `vbahQhFSwwDoiiVejrNK+J0kHzSXfpsrKUdA==","browserToken":"1@j0xsi0MpeL2iqqBbTvmyzDMTvgADmzcwGbjFDDSdvAf964rixww/dZjN6jIXT5CzC3vbY8ySFkHvMOCOtFUrZsTQzic1pmav3EgUkrnXs69+In9ChizLWq/BJE/yqs4/GVJ+KM91owJ2ljqqJEpJoQ==","clientToken":"6FMbd4urLIshwdgdAbosvQoJT9A3QrmPKRREr9LvOmS4PntoN21Z3PpPLdWtDZljk9Fq1woBTNCRRRrqoFCv1Q==","lc":"GB","lg":"en","locales":"en-GB,zh-Hans-AT,en-AT,de-AT","is24h":true,"secret":"pOn4rivIMkF1gYaTPdX9zXiMmqbzIj/gf3diQpvOZyz/6jSj2Et6KNcZEHsC2pQ4onDKADn/39qSrpg/oo1WtkskDdOM0BmpQXDxo56ILvSDEjQmVqvRGwy9WiitQ3hR2++Lah0cLFUx/xceAT0dliERXs/zRUmM1PU5+TJJHkEgxRQK+8xSTHqSjhNjtfcz","protoVersion":[0,17],"binVersion":10,"battery":18,"plugged":false,"platform":"iphone","features":{"KEY_PARTICIPANT":true,"FLAGS":"EAEYASACKAEwAjgBQAFIAVgBYAFoAXgBmAEBoAEBqAEBsAECuAEBwAEByAEB0AEC2AEB8AED+AED"},"phone":{"wa_version":"2.19.120","mcc":"232","mnc":"007","os_version":"12.4.3","device_manufacturer":"Apple","device_model":"iPhone 5s","os_build_number":"undefined"},"pushname":"Jakob","tos":0}]
s2,["Blocklist",{"id":1,"blocklist":["4369910417794@c.us","491637943506@c.us","212622468925@c.us","4368110889280@c.us","436766726448@c.us"]}]
s3,["Stream","update",true,"0.3.9308"]
s4,["Props",{"webVoipInternalTester":false,"webCleanIncomingFilename":1,"webEnableModelStorage":false,"wsCanCacheRequests":true,"wsOverrideTimeout":3,"wsOverrideAttempts":2,"wsOverride":true,"notificationQuery":true,"fbCrashlog":true,"bucket":"","gifSearch":"tenor","SPAM":true,"SET_BLOCK":true,"MESSAGE_INFO":true,"maxFileSize":100,"media":64,"maxSubject":25,"maxParticipants":257,"videoMaxEdge":960,"imageMaxKBytes":1024,"imageMaxEdge":1600,"frequentlyForwardedMessages":1,"suspiciousLinks":1,"fwdUiStartTs":1531267200,"restrictGroups":1,"groupDescLength":512,"multicastLimitGlobal":5,"finalLiveLocation":1,"frequentlyForwardedMax":5,"mmsMediaKeyTTL":172800,"stickers":1,"announceGroups":1001}]
`;
let secret = /\"secret\"\s?:\s?\"(.*?)\"/.exec(ex)[0];
secret = secret.split(':')[1].replace(/"/g, '');

// take secret
const secretBytes = Buffer.from(secret, 'base64');
// take first 32 bytes
const secret32Bytes = secretBytes.slice(0, 32);
// create public key from it
const sharedPub = ec.keyFromPublic(secret32Bytes, 'array');
// derive shared secret from that, and out keypair
const sharedSecret = A.derive(sharedPub.getPublic());
console.log(r);

//    let sharedSecretExpanded = HKDF(HmacSha256(repeatedNumToBits(0, 32), sjcl.codec.arrayBuffer.toBits(sharedSecret.buffer)), 80);

// expand to 80 bytes using HKDF
const expand = hkdf('sha256')(Buffer.alloc(32, 0), sharedSecret);
crypto.