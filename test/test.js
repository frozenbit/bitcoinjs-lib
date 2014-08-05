//
// Testing elliptic curve math
// -----------------------------------------------------------------------------
module("ec");

var ecparams = getSECCurveByName("secp256k1");
var rng = new SecureRandom();

test("Classes", function () {
  expect(3);
  ok(ECPointFp, "ECPointFp");
  ok(ECFieldElementFp, "ECFieldElementFp");
  ok(ECCurveFp, "ECCurveFp");
});

test("Point multiplication", function () {
  expect(5);

  var G = ecparams.getG();
  var n = ecparams.getN();

  ok(G.multiply(n).isInfinity(), "Gn is infinite");

  var k = Bitcoin.ECDSA.getBigRandom(n);
  var P = G.multiply(k);
  ok(!P.isInfinity(), "kG is not infinite");
  ok(P.isOnCurve(), "kG on curve");
  ok(P.multiply(n).isInfinity(), "kGn is infinite");

  ok(P.validate(), "kG validates as a public key");
});


//
// Testing ECDSA
// -----------------------------------------------------------------------------
module("ecdsa");

test("Classes", function () {
  expect(2);
  ok(Bitcoin.ECDSA, "Bitcoin.ECDSA");
  ok(Bitcoin.ECKey, "Bitcoin.ECKey");
});

test("Keys & Key Management", function () {
  expect(5);

  var s1 = new Bitcoin.ECKey();
  var p1 = s1.getPub();
  equal(p1.length, 65, "Public key is correct length");

  var p1_q = ECPointFp.decodeFrom(ecparams.getCurve(), p1);
  ok(p1_q, "Decode point from generated bytestring");
  ok(p1_q.validate(), "Is a valid public point");

  var p2 = Crypto.util.hexToBytes(
    "0486f356006a38b847bedec1bf47013776925d939d5a35a97a4d1263e550c7f1a" +
    "b5aba44ab74d22892097a0e851addf07ba97e33416df5affaceeb35d5607cd23c"
  );
  var p2_q = ECPointFp.decodeFrom(ecparams.getCurve(), p2);
  ok(p2_q, "Decode point from constant");
  ok(p2_q.validate(), "Is a valid public point");
});

test("Signing and Verifying", function () {
  expect(5);

  var s1 = new Bitcoin.ECKey();
  var sig_a = s1.sign(BigInteger.ZERO);
  ok(sig_a, "Sign null");
  ok(s1.verify(BigInteger.ZERO, sig_a));

  var message = new BigInteger(1024, rng).toByteArrayUnsigned();
  var hash = Crypto.SHA256(message, {asBytes: true});
  var sig_b = s1.sign(hash);
  ok(sig_b, "Sign random string");
  ok(s1.verify(hash, sig_b));

  var message2 = Crypto.util.hexToBytes(
    "12dce2c169986b3346827ffb2305cf393984627f5f9722a1b1368e933c8d" +
    "d296653fbe5d7ac031c4962ad0eb1c4298c3b91d244e1116b4a76a130c13" +
    "1e7aec7fa70184a71a2e66797052831511b93c6e8d72ae58a1980eaacb66" +
    "8a33f50d7cefb96a5dab897b5efcb99cbafb0d777cb83fc9b2115b69c0fa" +
    "3d82507b932b84e4"
  );
  var hash2 = Crypto.SHA256(message2, {asBytes: true});
  var sig_c = Crypto.util.hexToBytes(
    "3044022038d9b8dd5c9fbf330565c1f51d72a59ba869aeb2c2001be959d3" +
    "79e861ec71960220a73945f32cf90d03127d2c3410d16cee120fa1a4b4c3" +
    "f273ab082801a95506c4"
  );
  var s2 = Crypto.util.hexToBytes(
    "045a1594316e433fb91f35ef4874610d22177c3f1a1060f6c1e70a609d51" +
    "b20be5795cd2a5eae0d6b872ba42db95e9afaeea3fbb89e98099575b6828" +
    "609a978528"
  );
  ok(Bitcoin.ECDSA.verify(hash2, sig_c, s2), "Verify constant signature");
});

//
// Testing Paillier
// -----------------------------------------------------------------------------
module("paillier");

test("Classes", function () {
  expect(3);
  ok(Bitcoin.Paillier, "Bitcoin.Paillier");
  ok(Bitcoin.Paillier.PublicKey, "Bitcoin.Paillier.PublicKey");
  ok(Bitcoin.Paillier.PrivateKey, "Bitcoin.Paillier.PrivateKey");
});

//
// Testing Address
// -----------------------------------------------------------------------------
module("Addresses");

test("Standard Addresses - Prod network", function () {
  expect(7);
  ok(Bitcoin.Address, "Bitcoin.Address");
  Bitcoin.setNetwork('prod');
  var addrString = '1Hinfhwcv3QGv2wYDyenQECR5QXnxBcz1w';
  var address = new Bitcoin.Address(addrString);
  ok(address, "Address from string address");
  equal(address.toString(), addrString, "toString");
  equal(true, address.isPubKeyHashAddress(), 'isPubKeyHash');
  equal(false, address.isP2SHAddress(), 'isPubKeyHash');
  equal(true, Bitcoin.Address.validate(addrString), 'validate');
  equal(false, Bitcoin.Address.validate('xyzzy'), 'validate invalid string');
});

test("MultiSig Addresses - Prod network", function () {
  expect(5);
  Bitcoin.setNetwork('prod');
  var keys = [];
  for (var index = 0; index < 3; ++index) {
    keys.push(new Bitcoin.ECKey().getPub());
  }
  var multiSigAddress = Bitcoin.Address.createMultiSigAddress(keys, 2);
  ok(multiSigAddress, "createMultiSigAddress");
  ok(multiSigAddress.toString(), "toString");
  equal(false, multiSigAddress.isPubKeyHashAddress(), 'isPubKeyHash');
  equal(true, multiSigAddress.isP2SHAddress(), 'isPubKeyHash');

  equal(true, Bitcoin.Address.validate(multiSigAddress.toString()), 'validate');
});

test("Standard Addresses - Test network", function () {
  expect(6);
  Bitcoin.setNetwork('testnet');
  var addrString = 'mgv5oJf5tv5YifH9xTuneRNEbRdG5ryocq';
  var address = new Bitcoin.Address(addrString);
  ok(address, "Address from string address");
  equal(address.toString(), addrString, "toString");
  equal(true, address.isPubKeyHashAddress(), 'isPubKeyHash');
  equal(false, address.isP2SHAddress(), 'isPubKeyHash');
  equal(true, Bitcoin.Address.validate(addrString), 'validate');
  equal(false, Bitcoin.Address.validate('xyzzy'), 'validate invalid string');
});

test("MultiSig Addresses - Test network", function () {
  expect(5);
  Bitcoin.setNetwork('testnet');
  var keys = [];
  for (var index = 0; index < 3; ++index) {
    keys.push(new Bitcoin.ECKey().getPub());
  }
  var multiSigAddress = Bitcoin.Address.createMultiSigAddress(keys, 2);
  ok(multiSigAddress, "createMultiSigAddress");
  ok(multiSigAddress.toString(), "toString");
  equal(false, multiSigAddress.isPubKeyHashAddress(), 'isPubKeyHash');
  equal(true, multiSigAddress.isP2SHAddress(), 'isPubKeyHash');

  equal(true, Bitcoin.Address.validate(multiSigAddress.toString()), 'validate');
});

test("MultiSig Addresses - reject bad args", function() {
  expect(1);
  Bitcoin.setNetwork('prod');
  var keys = [];
  for (var index = 0; index < 3; ++index) {
    keys.push(new Bitcoin.ECKey());
  }
  throws(function() {
    // Can't create using ECKey - must be an array of pubKeys
    var multiSigAddress = Bitcoin.Address.createMultiSigAddress(keys, 2);
  });
});

test("Construction", function() {
  expect(6);
  var key = new Bitcoin.ECKey();
  throws(function() { new Bitcoin.Address() }, "Missing data");
  var address = new Bitcoin.Address(key.getBitcoinAddress().toString());
  ok(address, "from string");
  equal(key.getBitcoinAddress().toString(), address.toString(), "from string");
  equal(Bitcoin.Address.pubKeyHashVersion, address.version, "version");
  address = new Bitcoin.Address(key);
  ok(address, "from eckey");
  equal(key.getBitcoinAddress().toString(), address.toString(), "from eckey");
});

//
// Testing ECKey
// -----------------------------------------------------------------------------
module("ECKey");

test("Prod network", function() {
  expect(3);
  Bitcoin.setNetwork('prod');
  var addrString = '18J3WnE5t3xn6xYeugHwXC4MBbPB9irWem';
  var privKeyString = '5J7MRWpRSPFSDvC4A6pnp58F1nJGri9cQuAtwr6f393958RqKD6';

  var eckey = new Bitcoin.ECKey();
  ok(eckey, "create");

  eckey = new Bitcoin.ECKey(privKeyString);
  ok(eckey, "decode from private key string");
  equal(eckey.getBitcoinAddress().toString(), addrString, "getBitcoinAddress");
});

test("Test network", function() {
  expect(3);
  Bitcoin.setNetwork('testnet');
  var addrString = 'mjcwLf1Kt7m3k941Qb2m5m2JXRwuE5op1F';
  var privKeyString = '93ETBJspobVrHcX5jedm3G7mhpvwyqGk4CjkorjMhUGDVm2bYqw';

  var eckey = new Bitcoin.ECKey();
  ok(eckey, "create");

  eckey = new Bitcoin.ECKey(privKeyString);
  ok(eckey, "decode from private key string");
  equal(eckey.getBitcoinAddress().toString(), addrString, "getBitcoinAddress");
});

//
// Testing Script
// -----------------------------------------------------------------------------
module("Script");

test("Build Scripts", function() {
  expect(4);
  var script = new Bitcoin.Script();
  ok(script, "create");
  equal(undefined, script.writeOp(Bitcoin.Opcode.OP_0), "writeOp");
  equal(undefined, script.writeBytes('hello world'), "writeBytes");
  equal('Strange', script.getOutType(), "getOutputType");
});

test("Pay To PubKey Hash Output Script", function() {
  expect(6);
  var key = new Bitcoin.ECKey();
  var address = new Bitcoin.Address(key);
  var script = Bitcoin.Script.createOutputScript(address);
  ok(script, "createOutputScript");
  equal(script.chunks.length, 5);

  equal('Address', script.getOutType(), "Output Script Type");
  equal(script.toString(), 'OP_DUP OP_HASH160 ' + Bitcoin.Util.bytesToHex(key.getPubKeyHash()) + ' OP_EQUALVERIFY OP_CHECKSIG');

  var addresses = [];
  script.extractAddresses(addresses);
  equal(1, addresses.length, "extract addresses count");
  equal(address.toString(), addresses[0].toString(), "extract addresses");
});

test("Pay To Script Hash Output Script", function() {
  expect(6);
  var keys = [];
  for (var index = 0; index < 3; ++index) {
    keys.push(new Bitcoin.ECKey().getPub());
  }
  var multiSigAddress = Bitcoin.Address.createMultiSigAddress(keys, 2);
  var script = Bitcoin.Script.createOutputScript(multiSigAddress);
  ok(script, "createOutputScript");
  equal(script.chunks.length, 3);

  equal('P2SH', script.getOutType(), "Output Script Type");
  equal(script.toString(), 'OP_HASH160 ' + Bitcoin.Util.bytesToHex(script.simpleOutHash()) + ' OP_EQUAL');

  var addresses = [];
  script.extractAddresses(addresses);
  equal(1, addresses.length, "extract addresses count");
  equal(multiSigAddress.toString(), addresses[0].toString(), "extract addresses");
});

test("Decode MultiSig Input Script", function() {
  var key, keys = [], hexKeys = [];
  for (var index = 0; index < 3; ++index) {
    key = new Bitcoin.ECKey().getPub();
    keys.push(key);
    hexKeys.push(Bitcoin.Util.bytesToHex(key));
  }
  var multiSigAddress = Bitcoin.Address.createMultiSigAddress(keys, 2);
  ok(multiSigAddress, 'created address');
  var redeemScript = multiSigAddress.redeemScript;
  ok(redeemScript, 'got redeem script');

  var hex = Bitcoin.Util.bytesToHex(redeemScript);
  ok(hex, 'converted to hex');
  var bytes = Bitcoin.Util.hexToBytes(hex);
  ok(bytes, 'converted back to bytes');
  var script = new Bitcoin.Script(bytes);
  ok(script, 'created script');

  equal(script.toString(), 'OP_2 ' + hexKeys.join(' ') + ' OP_3 OP_CHECKMULTISIG');

  var addresses = [];
  var count = script.extractMultiSigPubKeys(addresses);
  equal(count, 3, 'found right number of addresses');
  deepEqual(addresses[0], keys[0], 'key #0 is ok');
  deepEqual(addresses[1], keys[1], 'key #1 is ok');
  deepEqual(addresses[2], keys[2], 'key #2 is ok');
});


//
// Testing Transaction
// -----------------------------------------------------------------------------
module("Transaction");

test("Construction", function() {
  Bitcoin.setNetwork('testnet');
  var addrString = 'mgv5oJf5tv5YifH9xTuneRNEbRdG5ryocq';

  var transaction = new Bitcoin.Transaction();
  ok(transaction, "create");
  transaction.addOutput(new Bitcoin.Address(addrString), 50);
  transaction.addOutput(new Bitcoin.Address(addrString), 50*1e8);
  transaction.addOutput(new Bitcoin.Address(addrString), 500*1e8);
  transaction.addOutput(new Bitcoin.Address(addrString), 5000*1e8);
  transaction.addOutput(new Bitcoin.Address(addrString), 500000*1e8);
  var bytes = transaction.serialize();
  ok(bytes, "serialize");
  var tx2 = Bitcoin.Transaction.deserialize(bytes);
  ok(tx2, "deserialize");
  deepEqual(transaction.getHashBytes(), tx2.getHashBytes(), "deserialized matches tx");
  equal(transaction.outs[0].value, 50, '50 satoshi output');
  equal(transaction.outs[1].value, 50*1e8, '50 btc output');
  equal(transaction.outs[2].value, 500*1e8, '500 btc output');
  equal(transaction.outs[3].value, 5000*1e8, '5000 btc output');
  equal(transaction.outs[4].value, 500000*1e8, '500000 btc output');
});

test("Deserialize", function() {
  Bitcoin.setNetwork('prod');
  var txData = '010000000109a6b9c2dfb6e079b999fc70253daec45113435f424c2e20a119c00bac10b3f2000000008a473044022037b4f12c6f74cbaf01b436a87690ba64ec261bd5f46684b3740f516345c0820802206f11e21666af0284909e98f82a036be4923ef6b69b341413b41fd1af9905c508014104eea86b034ea326a28aac964594802fa458455bafe71b7107fa0aad808391265ac0a6e0b9ddb2a4770631792c870c9ce19075c2d41e62f60bce62b9751f19e116ffffffff0150c30000000000001976a9147b76594a27264f6bdd7f0c4a14735aa3421d22fb88ac00000000';
  var tx = Bitcoin.Transaction.deserialize(Bitcoin.Util.hexToBytes(txData));
  ok(tx, "deserialize");
  equal(1, tx.ins.length, "input length");
  equal(1, tx.outs.length, "output length");
});

test("Serialize", function() {
  var txData = '010000000109a6b9c2dfb6e079b999fc70253daec45113435f424c2e20a119c00bac10b3f2000000008a473044022037b4f12c6f74cbaf01b436a87690ba64ec261bd5f46684b3740f516345c0820802206f11e21666af0284909e98f82a036be4923ef6b69b341413b41fd1af9905c508014104eea86b034ea326a28aac964594802fa458455bafe71b7107fa0aad808391265ac0a6e0b9ddb2a4770631792c870c9ce19075c2d41e62f60bce62b9751f19e116ffffffff0150c30000000000001976a9147b76594a27264f6bdd7f0c4a14735aa3421d22fb88ac00000000';
  var inputTransaction = Bitcoin.Transaction.deserialize(Bitcoin.Util.hexToBytes(txData));
  var tx = new Bitcoin.Transaction();

  tx.addInput(inputTransaction, 0);
  ok(tx, "add input");
  equal(1, tx.ins.length, "input length");

  tx.addOutput(new Bitcoin.Address(new Bitcoin.ECKey()), 50000);
  var bytes = tx.serialize();
  ok(bytes, 'serialize ok');
  var tx2 = Bitcoin.Transaction.deserialize(bytes);
  deepEqual(tx.getHashBytes(), tx2.getHashBytes(), 'hash is ok');
  equal(tx2.ins.length, 1, 'input length ok');
  equal(tx2.outs.length, 1, 'output length ok');
});

test("Sign Standard Transaction", function() {
  Bitcoin.setNetwork('prod');
  var prevTxData = '0100000001e0214ebebb0fd3414d3fdc0dbf3b0f4b247a296cafc984558622c3041b0fcc9b010000008b48304502206becda98cecf7a545d1a640221438ff8912d9b505ede67e0138485111099f696022100ccd616072501310acba10feb97cecc918e21c8e92760cd35144efec7622938f30141040cd2d2ce17a1e9b2b3b2cb294d40eecf305a25b7e7bfdafae6bb2639f4ee399b3637706c3d377ec4ab781355add443ae864b134c5e523001c442186ea60f0eb8ffffffff03a0860100000000001976a91400ea3576c8fcb0bc8392f10e23a3425ae24efea888ac40420f00000000001976a91477890e8ec967c5fd4316c489d171fd80cf86997188acf07cd210000000001976a9146fb93c557ee62b109370fd9003e456917401cbfa88ac00000000';
  var txData = '0100000001344630cbff61fbc362f7e1ff2f11a344c29326e4ee96e787dc0d4e5cc02fd069000000004a493046022100ef89701f460e8660c80808a162bbf2d676f40a331a243592c36d6bd1f81d6bdf022100d29c072f1b18e59caba6e1f0b8cadeb373fd33a25feded746832ec179880c23901ffffffff0100f2052a010000001976a914dd40dedd8f7e37466624c4dacc6362d8e7be23dd88ac00000000';
  var tx = new Bitcoin.Transaction();
  var prevTx = new Bitcoin.Transaction.deserialize(Bitcoin.Util.hexToBytes(prevTxData));

  tx.addInput(prevTx, 0);
  tx.addOutput(new Bitcoin.Address('15mMHKL96tWAUtqF3tbVf99Z8arcmnJrr3'), 40000);
  tx.addOutput(new Bitcoin.Address('1Bu3bhwRmevHLAy1JrRB6AfcxfgDG2vXRd'), 50000);

  var key = new Bitcoin.ECKey('L44f7zxJ5Zw4EK9HZtyAnzCYz2vcZ5wiJf9AuwhJakiV4xVkxBeb');
  tx.signWithKey(key);

  var hexScript = Bitcoin.Util.bytesToHex(prevTx.outs[0].script.buffer);

  ok(tx.verifySignatures([hexScript]), 'signatures verify');
});

test("Sign MultiSig Transaction", function() {
  // from: https://gist.github.com/gavinandresen/3966071
  var key1 = new Bitcoin.ECKey('5JaTXbAUmfPYZFRwrYaALK48fN6sFJp4rHqq2QSXs8ucfpE4yQU');
  equal(key1.getPubKeyHex(), '0491BBA2510912A5BD37DA1FB5B1673010E43D2C6D812C514E91BFA9F2EB129E1C183329DB55BD868E209AAC2FBC02CB33D98FE74BF23F0C235D6126B1D8334F86', 'key1 is ok');
  var key2 = new Bitcoin.ECKey('5Jb7fCeh1Wtm4yBBg3q3XbT6B525i17kVhy3vMC9AqfR6FH2qGk');
  equal(key2.getPubKeyHex(), '04865C40293A680CB9C020E7B1E106D8C1916D3CEF99AA431A56D253E69256DAC09EF122B1A986818A7CB624532F062C1D1F8722084861C5C3291CCFFEF4EC6874', 'key2 is ok');
  var key3 = new Bitcoin.ECKey('5JFjmGo5Fww9p8gvx48qBYDJNAzR9pmH5S389axMtDyPT8ddqmw');
  equal(key3.getPubKeyHex(), '048D2455D2403E08708FC1F556002F1B6CD83F992D085097F9974AB08A28838F07896FBAB08F39495E15FA6FAD6EDBFB1E754E35FA1C7844C41F322A1863D46213', 'key3 is ok');

  var multiSigAddress = Bitcoin.Address.createMultiSigAddress([key1.getPub(), key2.getPub(), key3.getPub()], 2);
  equal(multiSigAddress.toString(), '3QJmV3qfvL9SuYo34YihAf3sRCW3qSinyC', "Created multisig addr");
  equal(Bitcoin.Util.bytesToHex(multiSigAddress.redeemScript), '52410491bba2510912a5bd37da1fb5b1673010e43d2c6d812c514e91bfa9f2eb129e1c183329db55bd868e209aac2fbc02cb33d98fe74bf23f0c235d6126b1d8334f864104865c40293a680cb9c020e7b1e106d8c1916d3cef99aa431a56d253e69256dac09ef122b1a986818a7cb624532f062c1d1f8722084861c5c3291ccffef4ec687441048d2455d2403e08708fc1f556002f1b6cd83f992d085097f9974ab08a28838f07896fbab08f39495e15fa6fad6edbfb1e754e35fa1c7844c41f322a1863d4621353ae', "computed correct redeem script");

  var txData = "010000000189632848f99722915727c5c75da8db2dbf194342a0429828f66ff88fab2af7d60000000000ffffffff0140420f000000000017a914f815b036d9bbbce5e9f2a00abd1bf3dc91e955108700000000"
  var tx = Bitcoin.Transaction.deserialize(Bitcoin.Util.hexToBytes(txData));
  ok(tx, 'created unsigned tx');
  equal(tx.verifySignatures(['']), false, 'unsigned');
  equal(tx.ins.length, 1, '1 input');

  // We need to add the script to the inputs so that signing can work.
  tx.ins[0].script = new Bitcoin.Script(Bitcoin.Util.hexToBytes('a914f815b036d9bbbce5e9f2a00abd1bf3dc91e9551087'));

  var sigCount = tx.signWithMultiSigScript([key1], new Bitcoin.Script(multiSigAddress.redeemScript));
  equal(sigCount, 1, 'applied first sig');

  sigCount = tx.signWithMultiSigScript([key1], new Bitcoin.Script(multiSigAddress.redeemScript));
  equal(sigCount, 0, 'duplicate sig failed');

  var sigCount = tx.signWithMultiSigScript([key2], new Bitcoin.Script(multiSigAddress.redeemScript));
  equal(sigCount, 1, 'applied second sig');
});

test("Verify Gavin's P2SH Test", function() {
  // from: https://gist.github.com/gavinandresen/3966071
  var txData = "0100000001aca7f3b45654c230e0886a57fb988c3044ef5e8f7f39726d305c61d5e818903c00000000fd5d010048304502200187af928e9d155c4b1ac9c1c9118153239aba76774f775d7c1f9c3e106ff33c0221008822b0f658edec22274d0b6ae9de10ebf2da06b1bbdaaba4e50eb078f39e3d78014730440220795f0f4f5941a77ae032ecb9e33753788d7eb5cb0c78d805575d6b00a1d9bfed02203e1f4ad9332d1416ae01e27038e945bc9db59c732728a383a6f1ed2fb99da7a4014cc952410491bba2510912a5bd37da1fb5b1673010e43d2c6d812c514e91bfa9f2eb129e1c183329db55bd868e209aac2fbc02cb33d98fe74bf23f0c235d6126b1d8334f864104865c40293a680cb9c020e7b1e106d8c1916d3cef99aa431a56d253e69256dac09ef122b1a986818a7cb624532f062c1d1f8722084861c5c3291ccffef4ec687441048d2455d2403e08708fc1f556002f1b6cd83f992d085097f9974ab08a28838f07896fbab08f39495e15fa6fad6edbfb1e754e35fa1c7844c41f322a1863d4621353aeffffffff0140420f00000000001976a914ae56b4db13554d321c402db3961187aed1bbed5b88ac00000000";
  var tx = Bitcoin.Transaction.deserialize(Bitcoin.Util.hexToBytes(txData));
  ok(tx, 'parsed transaction');

  equal(tx.ins.length, 1, 'inputs length ok');
  equal(tx.outs.length, 1, 'output length ok');
  equal(tx.outs[0].value, 0.01 * 1e8, 'outputs.value ok');

  ok(tx.verifySignatures(['']), 'signatures verify');
});

test("Verify P2SH Signatures", function() {
  var txData = "0100000001dd6e93887a3927b29091702f765f46e4c1a24a287f4bc84fd1fe8c423ea1c36400000000fd5f0100483045022018d16e03bceffde4a44eb82355bd6686db88e45189bbab07a23d94bbb4f8bcc3022100d4e3114c7fc9ef60ec905593eb7fe893095ca5edd526a2bce2d2f79c649cf49a01493046022100ff40b3899deabbdd18351c6cc63e714e5ac7fe8ba98ffc06c07f00fe06b57b45022100af2fed17e496d2278461b390b7395bd736a35bc59c9b075343661a0c0933f6c2014cc9524104c688e3fefa12c5cc9f900ec28fe0e2a2fe2ead93fc37570b6c5713b9474be9e03abb1030a79eec8839bc24f7fac9e860d63c4333d7cc32913baa1e7108280ad34104f86f9979c4787613939a7cb73c2a593e1f57784cc32acfa234f21b22bd631b0aca9061de23476d1a52386481ca71f350ae180fdac3c3bafed05fee70c41710c9410486dea9f8df8ce56403237d40235e06b7b8faca3ce719cf83aaf596d4cc03e3c79dc4d0784619eb7f3339dabfac27f4f07746894a8001df4e24f1a6ae1c6e812453aeffffffff0200e1f505000000001976a91402f13f9da223c6d7eb7680c7df8270f3a363aeb588acf0f00c8f0000000017a9142cfd6634df0dbbe8e02618aaa13de49a4d07d4968700000000";
  var tx = Bitcoin.Transaction.deserialize(Bitcoin.Util.hexToBytes(txData));
  ok(tx, 'parsed transaction');
  ok(tx.verifySignatures(['']), 'signatures verify');
});

test("Verify Standard Signatures", function() {
  var txData = "010000000109a6b9c2dfb6e079b999fc70253daec45113435f424c2e20a119c00bac10b3f2010000006b483045022100bfc238497465e46ed499a64f5f00e6c8030a3cc937bba333b08ca8aa7ff4fe800220362cb9e93032b5a6e48220813e76f86a01580cd5ff699de973f15499178187910121023d8f23f7ae9b8b76cc497af97cf1172d5bc717146091aca42e1e006e1db04d2cffffffff02404b4c00000000001976a91406911c004633a6fabc2820937660a47e3233127488ac9f3a974a000000001976a9147b76594a27264f6bdd7f0c4a14735aa3421d22fb88ac00000000";
  var tx = Bitcoin.Transaction.deserialize(Bitcoin.Util.hexToBytes(txData));
  ok(tx, 'parsed transaction');

  var inputScripts = ['76a9147b76594a27264f6bdd7f0c4a14735aa3421d22fb88ac'];
  ok(tx.verifySignatures(inputScripts), 'signatures verify');
});

//
// Testing Random
// -----------------------------------------------------------------------------
module("Random");

test("Byte Random", function() {
  var random = new SecureRandom();
  var randomArray = new Array(16);

  random.nextBytes(randomArray);
  equal(16, randomArray.length, 'random array fill length');

  var foundNonzero = false;
  for (var index = 0; index < randomArray.length; ++index) {
    var elt = randomArray[index];
    equal(true, (elt >= 0 && elt < 256), 'random elt #' + index + ' is in range');
    if (elt != 0) {
      foundNonzero = true;
    }
  }
  equal(true, foundNonzero, 'not just a bunch of zeroes');
});


//
// Testing ECKey Chaining
// -----------------------------------------------------------------------------
module("ECKey Chains");

test("Basic Chaining", function() {
  var eckey = new Bitcoin.ECKey();
  ok(eckey, "created");
  var priv = eckey.priv;

  var random = new SecureRandom();

  var chainCode = new Array(32);
  random.nextBytes(chainCode);

  var newkey = Bitcoin.ECKey.createECKeyFromChain(priv.toByteArrayUnsigned(), chainCode);
  ok(newkey, "created chain from private key");
  notDeepEqual(newkey.getPub(), eckey.getPub(), 'chained public key is not equal to original public key');

  var hash = new Array(32);
  random.nextBytes(hash);

  // Verify the generated keys are different and can't sign for each other.
  var signature1 = eckey.sign(hash);
  var signature2 = newkey.sign(hash);
  equal(true, eckey.verify(hash, signature1), 'key1 can verify a its own sig');
  notEqual(true, eckey.verify(hash, signature2), 'key1 cannot verify key2\'s sig');
  equal(true, newkey.verify(hash, signature2), 'key2 can verify its own sig');
  notEqual(true, newkey.verify(hash, signature1), 'key2 cannot verify key1\'s sig');

  // Now, can we derive the same public key by chaining just the public key
  var pubkeyChain = Bitcoin.ECKey.createPubKeyFromChain(eckey.getPub(), chainCode);
  ok(pubkeyChain, 'created chain from pubkey');
  deepEqual(pubkeyChain, newkey.getPub(), 'chained public key derived from parent\'s public key matches that dervived from parent\'s private key');
  notDeepEqual(pubkeyChain, eckey.getPub(), 'chained public key derived from parent\'s public key does not match parent');
});

Object.associativeArraySize = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

test("Parallel Chains", function() {
  var random = new SecureRandom();

  var kNumParallelChains = 6;

  var eckey = new Bitcoin.ECKey();
  var chainedKeys = {};
  for (var index = 0; index < kNumParallelChains; ++index) {
    var chain = new Array(32);
    random.nextBytes(chain);
    var newkey = Bitcoin.ECKey.createECKeyFromChain(eckey.priv.toByteArrayUnsigned(), chain);
    chainedKeys[newkey.getBitcoinAddress().toString()] = { chain: chain, key: newkey };
  }
  equal(Object.associativeArraySize(chainedKeys), kNumParallelChains, "generated unique keys");

  for (var chainedKey in chainedKeys) {
     var elt = chainedKeys[chainedKey];
     var chain = elt.chain;
     var expectedPubKey = elt.key.getPub();
     var chainedPubKey = Bitcoin.ECKey.createPubKeyFromChain(eckey.getPub(), chain);
     deepEqual(chainedPubKey, expectedPubKey, 'derived pubkeys match for case: ' + chainedKey);
  }
});

test("Serial Chains", function() {
  var random = new SecureRandom();

  var kNumSerialChains = 6;

  var eckey = new Bitcoin.ECKey();
  var chainedKeys = [];
  var keyRoot = eckey;
  for (var index = 0; index < kNumSerialChains; ++index) {
    var chain = new Array(32);
    random.nextBytes(chain);
    var newkey = Bitcoin.ECKey.createECKeyFromChain(keyRoot.priv.toByteArrayUnsigned(), chain);
    chainedKeys.push({ chain: chain, key: newkey });
    keyRoot = newkey;
  }
  equal(Object.associativeArraySize(chainedKeys), kNumSerialChains, "generated unique keys");

  var chainHead = eckey.getPub();
  for (var index = 0; index < kNumSerialChains; ++index) {
     var elt = chainedKeys[index];
     var chain = elt.chain;

     var chainedPubKey = Bitcoin.ECKey.createPubKeyFromChain(chainHead, chain);
     var expectedPubKey = elt.key.getPub();

     var bitcoinAddress = Bitcoin.Address.fromPubKey(chainedPubKey);
     deepEqual(chainedPubKey, expectedPubKey, 'derived pubkeys match for case: ' + bitcoinAddress);
     chainHead = chainedPubKey;
  }
});


//
// Testing Util
// -----------------------------------------------------------------------------
module("Util");

test("bytesToBase64 - ok", function() {
  var randomArray = new Array(32);
  new SecureRandom().nextBytes(randomArray);

  var testArrays = [
    [1],
    [1,2,3,4,5,6,7],
    randomArray
  ];

  for (var index = 0; index < testArrays.length; ++index) {
    var a = testArrays[index];
    var s = Crypto.util.bytesToBase64(a);
    ok(s, 'encoded test array #' + index);
    var a2 = Crypto.util.base64ToBytes(s);
    ok(a2, 'decoded test array #' + index);
    deepEqual(a, a2, 'decoded array #' + index + ' matched');
  }
});

test("stringToBase58", function() {
  var tests = [
    'x',
    'hello world',
    'this is a place where my oysters eat sharks with laserbeams',
  ];

  for (var index = 0; index < tests.length; ++index) {
    var testString = tests[index];
    var enc = Bitcoin.Base58.encodeFromString(testString);
    ok(enc, 'encode case #' + index);
    var dec = Bitcoin.Base58.decodeToString(enc);
    equal(dec, testString, 'decode case #' + index);
  }

  throws(function() { Bitcoin.Base58.encodeFromString(''); }, 'empty string throws');
  throws(function() { Bitcoin.Base58.encodeFromString(1234); }, 'integer input throws');
  throws(function() { Bitcoin.Base58.encodeFromString([1,2,3,4]); }, 'array input throws');
});

test("numToVarInt", function() {
  var data = [
    [0, '00' ],
    [1, '01'],
    [253, 'fdfd00'],
    [254, 'fdfe00'],
    [255, 'fdff00'],
    [0x100, 'fd0001'],
    [0x1000, 'fd0010'],
    [0x1001, 'fd0110'],
    [0x10000, 'fe00000100'],
    [0x12345, 'fe45230100'],
    [0x12345678, 'fe78563412'],
  ];
  data.forEach(function(datum) {
    var integer = datum[0];
    var result = datum[1];
    var actual = Bitcoin.Util.bytesToHex(Bitcoin.Util.numToVarInt(integer));
    ok(actual == result, 'should work for ' + integer);
  });
});

//
// Testing Scrypt
// -----------------------------------------------------------------------------
module("Scrypt");

test("basic hashing", function() {
  // Tests from http://tools.ietf.org/html/draft-josefsson-scrypt-kdf-00#page-9
  var tests = [
    {
      password: '',
      salt: '',
      N: 16,
      r: 1,
      p: 1,
      dkLen: 64,
      result: [
        0x77, 0xd6, 0x57, 0x62, 0x38, 0x65, 0x7b, 0x20, 0x3b, 0x19, 0xca, 0x42, 0xc1, 0x8a, 0x04, 0x97,
        0xf1, 0x6b, 0x48, 0x44, 0xe3, 0x07, 0x4a, 0xe8, 0xdf, 0xdf, 0xfa, 0x3f, 0xed, 0xe2, 0x14, 0x42,
        0xfc, 0xd0, 0x06, 0x9d, 0xed, 0x09, 0x48, 0xf8, 0x32, 0x6a, 0x75, 0x3a, 0x0f, 0xc8, 0x1f, 0x17,
        0xe8, 0xd3, 0xe0, 0xfb, 0x2e, 0x0d, 0x36, 0x28, 0xcf, 0x35, 0xe2, 0x0c, 0x38, 0xd1, 0x89, 0x06,
      ]
    },
    {
      password: 'password',
      salt: 'NaCl',
      N: 1024,
      r: 8,
      p: 16,
      dkLen: 64,
      result: [
        0xfd, 0xba, 0xbe, 0x1c, 0x9d, 0x34, 0x72, 0x00, 0x78, 0x56, 0xe7, 0x19, 0x0d, 0x01, 0xe9, 0xfe,
        0x7c, 0x6a, 0xd7, 0xcb, 0xc8, 0x23, 0x78, 0x30, 0xe7, 0x73, 0x76, 0x63, 0x4b, 0x37, 0x31, 0x62,
        0x2e, 0xaf, 0x30, 0xd9, 0x2e, 0x22, 0xa3, 0x88, 0x6f, 0xf1, 0x09, 0x27, 0x9d, 0x98, 0x30, 0xda,
        0xc7, 0x27, 0xaf, 0xb9, 0x4a, 0x83, 0xee, 0x6d, 0x83, 0x60, 0xcb, 0xdf, 0xa2, 0xcc, 0x06, 0x40,
      ]
    },
    {
      password: 'pleaseletmein',
      salt: 'SodiumChloride',
      N: 16384,
      r: 8,
      p: 1,
      dkLen: 64,
      result: [
        0x70, 0x23, 0xbd, 0xcb, 0x3a, 0xfd, 0x73, 0x48, 0x46, 0x1c, 0x06, 0xcd, 0x81, 0xfd, 0x38, 0xeb,
        0xfd, 0xa8, 0xfb, 0xba, 0x90, 0x4f, 0x8e, 0x3e, 0xa9, 0xb5, 0x43, 0xf6, 0x54, 0x5d, 0xa1, 0xf2,
        0xd5, 0x43, 0x29, 0x55, 0x61, 0x3f, 0x0f, 0xcf, 0x62, 0xd4, 0x97, 0x05, 0x24, 0x2a, 0x9a, 0xf9,
        0xe6, 0x1e, 0x85, 0xdc, 0x0d, 0x65, 0x1e, 0x40, 0xdf, 0xcf, 0x01, 0x7b, 0x45, 0x57, 0x58, 0x87,
      ]
    }
  ];

  for (var index = 0; index < tests.length; ++index) {
    var test = tests[index];
    var startTime = new Date();
    var hash = Bitcoin.scrypt(test.password, test.salt, test.N, test.r, test.p, test.dkLen);
    var endTime = new Date();
    console.log('Scrypt Test #' + index + ': ' +(endTime - startTime)+' ms');
    deepEqual(hash, test.result, 'Scrypt test #' + index);
  }
});


//
// Testing BIP38 Key Encryption/Decryption
// -----------------------------------------------------------------------------
module("bip38");

test("Classes", function () {
  expect(1);
  ok(Bitcoin.BIP38, "Bitcoin.BIP38");
});

test("No compression, no EC multiply #1", function () {
  expect(2);

  var wif = "5KN7MzqK5wt2TP1fQCYyHBtDrXdJuXbUzm4A9rKAteGu3Qi5CVR";
  var pw = "TestingOneTwoThree";
//  var encrypted = "6PRVWUbkzzsbcVac2qwfssoUJAN1Xhrg6bNk8J7Nzm5H7kxEbn2Nh2ZoGg";
  var encrypted = "6PRVWUbkzAjcW7NSD7e5QhD5d7ThtHb38QLgj5ajVeLgUjfgz3cpiXNwUq";

  var decrypted = new Bitcoin.ECKey(wif).getEncryptedFormat(pw);
  equal(decrypted, encrypted, "Key encrypted successfully.");
  equal(Bitcoin.ECKey.decodeEncryptedFormat(decrypted, pw).getWalletImportFormat(), wif, "Key decrypted successfully.");
});

test("No compression, no EC multiply #2", function () {
  expect(2);

  var wif = "5HtasZ6ofTHP6HCwTqTkLDuLQisYPah7aUnSKfC7h4hMUVw2gi5";
  var pw = "Satoshi";
//  var encrypted = "6PRNFFkZc2NZ6dJqFfhRoFNMR9Lnyj7dYGrzdgXXVMXcxoKTePPX1dWByq";
  var encrypted = "6PRNFFkZbins1dj6Y5wDqk8sBdULGiVqm8Yd2HAPdf2DoBfnGXRtgoh82f";

  var decrypted = new Bitcoin.ECKey(wif).getEncryptedFormat(pw);
  equal(decrypted, encrypted, "Key encrypted successfully.");
  equal(Bitcoin.ECKey.decodeEncryptedFormat(decrypted, pw).getWalletImportFormat(), wif, "Key decrypted successfully.");
});


test("Compression, no EC multiply #1", function () {
  expect(2);

  var wif = "L44B5gGEpqEDRS9vVPz7QT35jcBG2r3CZwSwQ4fCewXAhAhqGVpP";
  var pw = "TestingOneTwoThree";
//  var encrypted = "6PYNKZ1EAgYgmQfmNVamxyXVWHzK5s6DGhwP4J5o44cvXdoY7sRzhtpUeo";
  var encrypted = "6PYNKZ1EAuM1HMFx6NWXZTC625XmXTHzZi6UkDjji9wKGXLvUiDNaXGQaQ";

  var decrypted = new Bitcoin.ECKey(wif).getEncryptedFormat(pw);
  equal(decrypted, encrypted, "Key encrypted successfully.");
  equal(Bitcoin.ECKey.decodeEncryptedFormat(decrypted, pw).getWalletImportFormat(), wif, "Key decrypted successfully.");
});

test("Compression, no EC multiply #2", function () {
  expect(2);

  var wif = "KwYgW8gcxj1JWJXhPSu4Fqwzfhp5Yfi42mdYmMa4XqK7NJxXUSK7";
  var pw = "Satoshi";
//  var encrypted = "6PYLtMnXvfG3oJde97zRyLYFZCYizPU5T3LwgdYJz1fRhh16bU7u6PPmY7";
  var encrypted = "6PYLtMnXuuzQFRt2TtkJjwPKsZmBsTYo5EVfbwM2KnTLvvcdAu6WdgM4ct";

  var decrypted = new Bitcoin.ECKey(wif).getEncryptedFormat(pw);
  equal(decrypted, encrypted, "Key encrypted successfully.");
  equal(Bitcoin.ECKey.decodeEncryptedFormat(decrypted, pw).getWalletImportFormat(), wif, "Key decrypted successfully.");
});


// NOTE: Testing BIP38 keys generated with EC-multiply is difficult due to their non-deterministic nature.
//       This test only verifies that a new address/key can be generated with a password and later decrypted
//       with the same password.

test("EC multiply, no compression, no lot/sequence numbers", function () {
  expect(2);

  var pw = "TestingOneTwoThree";
  var intermediate = Bitcoin.BIP38.generateIntermediate(pw);
  var encryptedKey = Bitcoin.BIP38.newAddressFromIntermediate(intermediate, false);
  var decryptedKey = Bitcoin.BIP38.decode(encryptedKey.bip38PrivateKey, pw);

  ok(Bitcoin.ECKey.isBIP38Format(encryptedKey.bip38PrivateKey), "New EC-multiplied key appears to be valid BIP38 format.");
  equal(encryptedKey.address.toString(), decryptedKey.getBitcoinAddress().toString(), "Address of new EC-multiplied key matches address after decryption with password.");
});

test("EC multiply, no compression, lot/sequence numbers", function () {
  expect(6);

  var pw = "MOLON LABE", lot = 263183, seq = 1;
  var wrongAddress = '1Lurmih3KruL4xDB5FmHof38yawNtP9oGf', wrongPw = "MOLON LABIA", wrongConf = 'cfrm38V8G4qq2ywYEFfWLD5Cc6msj9UwsG2Mj4Z6QdGJAFQpdatZLavkgRd1i4iBMdRngDqDs51';

  // Generate intermediate
  var intermediate = Bitcoin.BIP38.generateIntermediate(pw, lot, seq);

  // Encrypt then decrypt
  var encryptedKey = Bitcoin.BIP38.newAddressFromIntermediate(intermediate, false);
  var decryptedKey = Bitcoin.BIP38.decode(encryptedKey.bip38PrivateKey, pw);

  ok(Bitcoin.ECKey.isBIP38Format(encryptedKey.bip38PrivateKey), "New EC-multiplied key appears to be valid BIP38 format.");
  equal(encryptedKey.address.toString(), decryptedKey.getBitcoinAddress().toString(), "Address of new EC-multiplied key matches address after decryption with password.");

  // Confirm
  var confirmTrue = Bitcoin.BIP38.verifyNewAddressConfirmation(encryptedKey.address, encryptedKey.confirmation, pw);
  var confirmFalse1 = Bitcoin.BIP38.verifyNewAddressConfirmation(wrongAddress, encryptedKey.confirmation, pw);
  var confirmFalse2 = Bitcoin.BIP38.verifyNewAddressConfirmation(encryptedKey.address.toString(), wrongConf, pw);
  var confirmFalse3 = Bitcoin.BIP38.verifyNewAddressConfirmation(encryptedKey.address.toString(), encryptedKey.confirmation, wrongPw);

  ok(confirmTrue, "Confirmation successful with good address, confirmation code, and password.");
  ok(!confirmFalse1, "Confirmation unsuccessful when given wrong address.");
  ok(!confirmFalse2, "Confirmation unsuccessful when given wrong confirmation code.");
  ok(!confirmFalse3, "Confirmation unsuccessful when given wrong password.");
});
