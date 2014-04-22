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
  expect(5);
  var key = new Bitcoin.ECKey();
  var address = new Bitcoin.Address(key);
  var script = Bitcoin.Script.createOutputScript(address);
  ok(script, "createOutputScript");
  equal(script.chunks.length, 5);

  equal('Address', script.getOutType(), "Output Script Type");

  var addresses = [];
  script.extractAddresses(addresses);
  equal(1, addresses.length, "extract addresses count");
  equal(address.toString(), addresses[0].toString(), "extract addresses");
});

test("Pay To Script Hash Output Script", function() {
  expect(5);
  var keys = [];
  for (var index = 0; index < 3; ++index) {
    keys.push(new Bitcoin.ECKey().getPub());
  }
  var multiSigAddress = Bitcoin.Address.createMultiSigAddress(keys, 2);
  var script = Bitcoin.Script.createOutputScript(multiSigAddress);
  ok(script, "createOutputScript");
  equal(script.chunks.length, 3);

  equal('P2SH', script.getOutType(), "Output Script Type");

  var addresses = [];
  script.extractAddresses(addresses);
  equal(1, addresses.length, "extract addresses count");
  equal(multiSigAddress.toString(), addresses[0].toString(), "extract addresses");
});

test("Decode MultiSig Input Script", function() {
  var keys = [];
  for (var index = 0; index < 3; ++index) {
    keys.push(new Bitcoin.ECKey().getPub());
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
  deepEqual(transaction.getHash(), tx2.getHash(), "deserialized matches tx");
  equal(transaction.outs[0].value, 50, '50 satoshi output');
  equal(transaction.outs[1].value, 50*1e8, '50 btc output');
  equal(transaction.outs[2].value, 500*1e8, '500 btc output');
  equal(transaction.outs[3].value, 5000*1e8, '5000 btc output');
  equal(transaction.outs[4].value, 500000*1e8, '500000 btc output');
});

test("Add Input", function() {
  var inputTransaction = new Bitcoin.Transaction();
  var transaction = new Bitcoin.Transaction();
  transaction.addInput(inputTransaction, 0);
  ok(transaction, "add input");
  equal(1, transaction.ins.length, "input length");
});

test("Parse", function() {
  Bitcoin.setNetwork('prod');
  var txString = '010000000109a6b9c2dfb6e079b999fc70253daec45113435f424c2e20a119c00bac10b3f2000000008a473044022037b4f12c6f74cbaf01b436a87690ba64ec261bd5f46684b3740f516345c0820802206f11e21666af0284909e98f82a036be4923ef6b69b341413b41fd1af9905c508014104eea86b034ea326a28aac964594802fa458455bafe71b7107fa0aad808391265ac0a6e0b9ddb2a4770631792c870c9ce19075c2d41e62f60bce62b9751f19e116ffffffff0150c30000000000001976a9147b76594a27264f6bdd7f0c4a14735aa3421d22fb88ac00000000';
  var txBytes = Crypto.util.hexToBytes(txString);
  var tx = Bitcoin.Transaction.deserialize(txBytes);
  ok(tx, "deserialize");
  equal(1, tx.ins.length, "input length");
  equal(1, tx.outs.length, "output length");
});

/*
test("Sign", function() {

});
*/

test("Verify", function() {
  // This is a transaction that never went through, and we need to find out why.
  // txhash is 86dc61528df1e0ff190bb3e1a4ccf9c0843fed5e25bb50e13875e0ecea098652
  var txData = '01000000011590a0d5560a022220996a466704427745d489465fb25b0b338344e7fe8fc6fe00000000fd5f0100483045022100bbf198a7b68bb12677d52af7e73e656bb08a1090b68531eba06c6ace565f7a1a02200864b7ae3ce342029b67d6a065363ee444dbed5de56a902b12e32e9013bda88101493046022100d7df7d9cf534a3caf1b8015664f0d2b192e266d899aec39935775c1ef4bdafa20221008f44f2a82ef6d6f48535b804d4a82632d491e54b5bf2a6337dc29a5528cdd5af014cc952410436e4130a66a0cbcc0ff85b19865194a8a2c0c6d43aba6902e7218f48e8aa7d3252619e4d31d173661d4ae42a133d437d98f9b19913557f3a95f1aeba97c91eeb4104ca4520c5455e1325a381645ea9dc69236256de9773c7acfc41de1bc63d928dae3fa16ae0ea7ed1163de2b35a4491fe7fb0d86df79239a3e5516865dc41b8c393410456c85a3a308e855a455836f3f5bc3aa7b9fc544efdba5f38b3a53f7c0618698cb4bc7afa0a4c332c43532dead39622b2de937b0984e3ebe0a00354b82fe766e053aeffffffff0220487801000000001976a9142d618e9a5f18a1364d914ff7a4f441c937c450c288ac931600000000000017a9142b61525ba3428cc7eac032196567cd88a922330e8700000000';

  // This is the input transaction
  // txhash is fec68ffee74483330b5bb25f4689d44577420467466a992022020a56d5a09015
  var txInputData = '01000000024b6092717a5541e440685261cf69b81e9b7406237acf74c1fc1b804c7e408e5e010000008b48304502203c53ad366df25c6bd8835fc4f8bb4dc8a1a49508933051b9e133320c01e2444d022100f45fa714f49d46b1467a746b8d08eccb82f9e38871a0766d24fb0f0e5728b394014104e9a50e5a6a2581ae573e8dab0048c01b2f00d129adb74fde4fc38689a9c201035d317f6233c2650bdc774525d8a57e499b3709f43cdfbae20af42f3db4053ee8ffffffff4b6092717a5541e440685261cf69b81e9b7406237acf74c1fc1b804c7e408e5e020000008b48304502204c90587b3bfd6e9eb7e6ec2c8c3289e9176f683285c3a59ce1dc762bbb2dba3b022100d92cef409e56da916e7f4fbc9ccfbe29b1a53afabffc9058b1204660023cbab7014104e9a50e5a6a2581ae573e8dab0048c01b2f00d129adb74fde4fc38689a9c201035d317f6233c2650bdc774525d8a57e499b3709f43cdfbae20af42f3db4053ee8ffffffff02b35e78010000000017a9142b61525ba3428cc7eac032196567cd88a922330e87a10e3d50000000001976a9146dace82d7b34b7e37b817d89b7c4af3c33a4c47c88ac00000000';

  var tx = Bitcoin.Transaction.deserialize(Bitcoin.Util.hexToBytes(txData));
  ok(tx);
  equal(tx.version, 1, 'check version');
  equal(tx.ins.length, 1, 'input count');
  equal(tx.outs.length, 2, 'output count');
console.dir(tx);
  deepEqual(Bitcoin.Util.bytesToHex(Bitcoin.Util.base64ToBytes(tx.ins[0].outpoint.hash).reverse()), 'fec68ffee74483330b5bb25f4689d44577420467466a992022020a56d5a09015', 'input 0 hash');
  equal(tx.ins[0].outpoint.index, 0, 'input 0 index');

  var txInput = Bitcoin.Transaction.deserialize(Bitcoin.Util.hexToBytes(txInputData));
  ok(txInput);
console.dir(txInput);
  equal(txInput.version, 1, 'check version');
  equal(txInput.ins.length, 2, 'input count');
  equal(txInput.outs.length, 2, 'output count');

  var scriptPub = txInput.outs[0].script;
  var script = new Bitcoin.Script(scriptPub);
  equal(script.getOutType(), 'P2SH');
  
  var signatureHash = tx.hashTransactionForSignature(scriptPub, 0, 1 /* SIGHASH_ALL */);
  // TODO: Flesh this out further.
});

test("Serialize", function() {
  var tx = new Bitcoin.Transaction();
  tx.addInput({hash: Bitcoin.Util.bytesToBase64(tx.getHash())}, 0);
  tx.addInput({hash: Bitcoin.Util.bytesToBase64(tx.getHash())}, 0);
  tx.addInput({hash: Bitcoin.Util.bytesToBase64(tx.getHash())}, 0);
  tx.addOutput(new Bitcoin.Address(new Bitcoin.ECKey()), 50000);
  var bytes = tx.serialize();
  ok(bytes, 'serialize ok');
  var tx2 = Bitcoin.Transaction.deserialize(bytes);
  deepEqual(tx.getHash(), tx2.getHash(), 'hash is ok');
  equal(tx2.ins.length, 3, 'input length ok');
  equal(tx2.outs.length, 1, 'output length ok');
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
    var s = Bitcoin.Util.bytesToBase64(a);
    ok(s, 'encoded test array #' + index);
    var a2 = Bitcoin.Util.base64ToBytes(s);
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
