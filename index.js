const { errors: rpcErrors } = require('eth-json-rpc-errors');
const bigInt = require('snarkjs-ses').bigInt
const babyJub = require('./utils/babyjub');
const poseidon = require("./utils/poseidon");
const createBlakeHash = require("blake-hash");

function toDate(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  return a.toLocaleString();
}

async function getActiveAccount(){
  const accounts = await wallet.send('eth_requestAccounts');
  return accounts[0];
}

wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  switch (requestObject.method) {

    case 'getPublicKey':
      return getPublicKey();

    case 'signMessage':
      const typed_inputs = requestObject.params.typed_inputs;
      const hash_settings = requestObject.params.hash_settings;
      const {inputs, strDisplay} = processTypedInputs(typed_inputs);
      const account = await getActiveAccount();
      const approved = await promptUser("Signing data for " + account + ":\n" + strDisplay);
      if (!approved) {
        throw rpcErrors.eth.unauthorized();
      }
      const privateKey = await getPrivateKey();
      const signature = signInputs(privateKey, hash_settings, inputs);
      return signature;

    default:
      throw rpcErrors.methodNotFound(requestObject);
  }
})

async function getPrivateKey () {
  // Create a unique private key for each Ethereum address of the user
  const appKey = await wallet.getAppKey();
  const account = await getActiveAccount();
  const secret = createBlakeHash("blake512").update("" + appKey + account.slice(2)).digest().toString("hex");
  const privateKey = bigInt("0x" + secret, 16).mod(babyJub.subOrder).toString(10);
  return privateKey;
}

async function getPublicKey () {
  const privateKey = await getPrivateKey();
  const publicKey = babyJub.mulPointEscalar(babyJub.Base8, privateKey);
  return { x: publicKey[0].toString(10), y: publicKey[1].toString(10) };
}

function sign(strKey, msg) {
  const key = bigInt(strKey);
  const prv = bigInt.leInt2Buff(key, 32);

  const h1 = createBlakeHash("blake512").update(prv).digest();
  const msgBuff = bigInt.leInt2Buff(bigInt(msg), 32);
  const rBuff = createBlakeHash("blake512").update(Buffer.concat([h1.slice(32, 64), msgBuff])).digest();
  let r = bigInt.leBuff2int(rBuff);
  r = r.mod(babyJub.subOrder);

  const A = babyJub.mulPointEscalar(babyJub.Base8, key);
  const R8 = babyJub.mulPointEscalar(babyJub.Base8, r);

  const hasher = poseidon.createHash(6, 6, 52);
  const hm = hasher([R8[0], R8[1], A[0], A[1], msg]);
  const S = r.add(hm.mul(key)).mod(babyJub.subOrder);

  const signature = {
    Rx: R8[0].toString(),
    Ry: R8[1].toString(),
    s: S.toString()
  };
  return signature;
}

function signInputs(privateKey, settings, inputs) {
  const hasher = poseidon.createHash(settings.t, settings.nRoundsF, settings.nRoundsP);
  const hash = hasher(inputs).toString(10);
  const signature = sign(privateKey, hash);
  return signature;
}

async function promptUser(message) {
  const response = await wallet.send({ method: 'confirm', params: [message] });
  return response;
}

function processTypedInputs(typed_inputs) {
  let inputs = [];
  let strDisplay = "";
  for (const input of typed_inputs) {
    inputs.push(input.value);
    let prettyValue = "";
    if (input.type == "bool") {
      prettyValue = (input.value == "0") ? "False" : "True";
    } else if (input.type == "timestamp" ) {
      prettyValue = toDate(input.value);
    } else if (input.type == "bips" ) {
      prettyValue = (100 * input.value / (100 * 100)) + "%";
    } else if (input.type == "number") {
      if (input.decimals) {
        prettyValue = input.value/Math.pow(10, input.decimals) + " (decimals: " + input.decimals + ")";
      } else {
        prettyValue = input.value;
      }
    } else {
      prettyValue = input.value;
    }
    if (input.display) {
      prettyValue = input.display + " (" + prettyValue + ")";
    }
    strDisplay += " - " + input.name + ": " + prettyValue + "\n";
  }
  return {inputs, strDisplay};
}
