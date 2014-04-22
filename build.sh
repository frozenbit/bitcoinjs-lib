#!/bin/sh

export SRCDIR=.
#    $SRCDIR/src/crypto-js/src/SHA1.js \
#    $SRCDIR/src/crypto-js/src/MD5.js \

export FILES="\
    $SRCDIR/src/header.js \

    $SRCDIR/src/crypto-js/src/Crypto.js \
    $SRCDIR/src/crypto-js/src/CryptoMath.js \
    $SRCDIR/src/crypto-js/src/BlockModes.js \
    $SRCDIR/src/crypto-js/src/SHA256.js \
    $SRCDIR/src/crypto-js/src/AES.js \
    $SRCDIR/src/crypto-js/src/PBKDF2.js \
    $SRCDIR/src/crypto-js/src/HMAC.js \
    $SRCDIR/src/sha512.js \

    $SRCDIR/src/crypto-js-etc/ripemd160.js \

    $SRCDIR/src/node-scrypt.js \

    $SRCDIR/src/jsbn/rng.js \
    $SRCDIR/src/jsbn/jsbn.js \
    $SRCDIR/src/jsbn/jsbn2.js \
    $SRCDIR/src/jsbn/ec.js \
    $SRCDIR/src/jsbn/sec.js \
    $SRCDIR/src/events/eventemitter.js \
    $SRCDIR/src/util.js \
    $SRCDIR/src/base58.js \
    $SRCDIR/src/bip38.js \
    $SRCDIR/src/address.js \
    $SRCDIR/src/ecdsa.js \
    $SRCDIR/src/eckey.js \
    $SRCDIR/src/opcode.js \
    $SRCDIR/src/script.js \
    $SRCDIR/src/transaction.js \
    $SRCDIR/src/bip32.js \
    $SRCDIR/src/bitcoin.js"

mkdir -p build

echo "Building build/bitcoinjs-lib.js"
cat $FILES > build/bitcoinjs-lib.js 
echo "Building build/bitcoinjs-lib.min.js"
uglifyjs -m -o build/bitcoinjs-lib.min.js $FILES

