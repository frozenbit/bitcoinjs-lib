//
// BIP0032 derivations
// -----------------------------------------------------------------------------
module("bip32");

// from https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#Test_Vectors
var bip32VectorsSet1 = {
  id: "Set 1",
  master: "000102030405060708090a0b0c0d0e0f",
  vectors: [
    [ "m",
      "xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8",
      "xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi"
    ],
    [ "m/0'",
      "xpub68Gmy5EdvgibQVfPdqkBBCHxA5htiqg55crXYuXoQRKfDBFA1WEjWgP6LHhwBZeNK1VTsfTFUHCdrfp1bgwQ9xv5ski8PX9rL2dZXvgGDnw",
      "xprv9uHRZZhk6KAJC1avXpDAp4MDc3sQKNxDiPvvkX8Br5ngLNv1TxvUxt4cV1rGL5hj6KCesnDYUhd7oWgT11eZG7XnxHrnYeSvkzY7d2bhkJ7"
    ],
    [ "m/0'/1",
      "xpub6ASuArnXKPbfEwhqN6e3mwBcDTgzisQN1wXN9BJcM47sSikHjJf3UFHKkNAWbWMiGj7Wf5uMash7SyYq527Hqck2AxYysAA7xmALppuCkwQ",
      "xprv9wTYmMFdV23N2TdNG573QoEsfRrWKQgWeibmLntzniatZvR9BmLnvSxqu53Kw1UmYPxLgboyZQaXwTCg8MSY3H2EU4pWcQDnRnrVA1xe8fs"
    ],
    [ "m/0'/1/2'",
      "xpub6D4BDPcP2GT577Vvch3R8wDkScZWzQzMMUm3PWbmWvVJrZwQY4VUNgqFJPMM3No2dFDFGTsxxpG5uJh7n7epu4trkrX7x7DogT5Uv6fcLW5",
      "xprv9z4pot5VBttmtdRTWfWQmoH1taj2axGVzFqSb8C9xaxKymcFzXBDptWmT7FwuEzG3ryjH4ktypQSAewRiNMjANTtpgP4mLTj34bhnZX7UiM"
    ],
    [ "m/0'/1/2'/2",
      "xpub6FHa3pjLCk84BayeJxFW2SP4XRrFd1JYnxeLeU8EqN3vDfZmbqBqaGJAyiLjTAwm6ZLRQUMv1ZACTj37sR62cfN7fe5JnJ7dh8zL4fiyLHV",
      "xprvA2JDeKCSNNZky6uBCviVfJSKyQ1mDYahRjijr5idH2WwLsEd4Hsb2Tyh8RfQMuPh7f7RtyzTtdrbdqqsunu5Mm3wDvUAKRHSC34sJ7in334"
    ],
    [ "m/0'/1/2'/2/1000000000",
      "xpub6H1LXWLaKsWFhvm6RVpEL9P4KfRZSW7abD2ttkWP3SSQvnyA8FSVqNTEcYFgJS2UaFcxupHiYkro49S8yGasTvXEYBVPamhGW6cFJodrTHy",
      "xprvA41z7zogVVwxVSgdKUHDy1SKmdb533PjDz7J6N6mV6uS3ze1ai8FHa8kmHScGpWmj4WggLyQjgPie1rFSruoUihUZREPSL39UNdE3BBDu76"
    ],
  ]
};

var bip32VectorsSet2 = {
  id:  "Set 2 ",
  master: "fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542",
  vectors: [
    [ "m",
      "xpub661MyMwAqRbcFW31YEwpkMuc5THy2PSt5bDMsktWQcFF8syAmRUapSCGu8ED9W6oDMSgv6Zz8idoc4a6mr8BDzTJY47LJhkJ8UB7WEGuduB",
      "xprv9s21ZrQH143K31xYSDQpPDxsXRTUcvj2iNHm5NUtrGiGG5e2DtALGdso3pGz6ssrdK4PFmM8NSpSBHNqPqm55Qn3LqFtT2emdEXVYsCzC2U"
    ],
    [ "m/0",
      "xpub69H7F5d8KSRgmmdJg2KhpAK8SR3DjMwAdkxj3ZuxV27CprR9LgpeyGmXUbC6wb7ERfvrnKZjXoUmmDznezpbZb7ap6r1D3tgFxHmwMkQTPH",
      "xprv9vHkqa6EV4sPZHYqZznhT2NPtPCjKuDKGY38FBWLvgaDx45zo9WQRUT3dKYnjwih2yJD9mkrocEZXo1ex8G81dwSM1fwqWpWkeS3v86pgKt"
    ],
    [ "m/0/2147483647'",
      "xpub6ASAVgeehLbnwdqV6UKMHVzgqAG8Gr6riv3Fxxpj8ksbH9ebxaEyBLZ85ySDhKiLDBrQSARLq1uNRts8RuJiHjaDMBU4Zn9h8LZNnBC5y4a",
      "xprv9wSp6B7kry3Vj9m1zSnLvN3xH8RdsPP1Mh7fAaR7aRLcQMKTR2vidYEeEg2mUCTAwCd6vnxVrcjfy2kRgVsFawNzmjuHc2YmYRmagcEPdU9"
    ],
    [ "m/0/2147483647'/1",
      "xpub6DF8uhdarytz3FWdA8TvFSvvAh8dP3283MY7p2V4SeE2wyWmG5mg5EwVvmdMVCQcoNJxGoWaU9DCWh89LojfZ537wTfunKau47EL2dhHKon",
      "xprv9zFnWC6h2cLgpmSA46vutJzBcfJ8yaJGg8cX1e5StJh45BBciYTRXSd25UEPVuesF9yog62tGAQtHjXajPPdbRCHuWS6T8XA2ECKADdw4Ef"
    ],
    [ "m/0/2147483647'/1/2147483646'",
      "xpub6ERApfZwUNrhLCkDtcHTcxd75RbzS1ed54G1LkBUHQVHQKqhMkhgbmJbZRkrgZw4koxb5JaHWkY4ALHY2grBGRjaDMzQLcgJvLJuZZvRcEL",
      "xprvA1RpRA33e1JQ7ifknakTFpgNXPmW2YvmhqLQYMmrj4xJXXWYpDPS3xz7iAxn8L39njGVyuoseXzU6rcxFLJ8HFsTjSyQbLYnMpCqE2VbFWc"
    ],
    [ "m/0/2147483647'/1/2147483646'/2",
      "xpub6FnCn6nSzZAw5Tw7cgR9bi15UV96gLZhjDstkXXxvCLsUXBGXPdSnLFbdpq8p9HmGsApME5hQTZ3emM2rnY5agb9rXpVGyy3bdW6EEgAtqt",
      "xprvA2nrNbFZABcdryreWet9Ea4LvTJcGsqrMzxHx98MMrotbir7yrKCEXw7nadnHM8Dq38EGfSh6dqA9QWTyefMLEcBYJUuekgW4BYPJcr9E7j"
    ],
  ]
};

// derivation creates keys that match what the test vectors has
test("Derivation 1", function () {

  var set1 = new Bip32VectorSet( bip32VectorsSet1 );
  var set2 = new Bip32VectorSet( bip32VectorsSet2 );

  var total = set1.length()*2 + set2.length()*2;

  expect( total );

  derivation1set( set1 ) ;
  derivation1set( set2 ) ;
});

function derivation1set( set ) {
  var bip32M = new BIP32( set.get(0).xprv );
  // skipping vector 0 'm'
  for( var i=0 ; i < set.length() ; i++ ) {
    var vector = set.get(i);
    var result = derivation1vector( bip32M, vector );
    equal( result.xprv, vector.xprv, set.id + " :" + i + ": xprv " + vector.chain );
    equal( result.xpub, vector.xpub, set.id + " :" + i + ": xpub " + vector.chain );
  }
}

function derivation1vector( bip32M, vector ) {
    var bip32D = bip32M.derive( vector.chain );
    var xprv = bip32D.extended_private_key_string("base58");
    var xpub = bip32D.extended_public_key_string("base58");
    var result = { xprv:xprv, xpub:xpub };
    return result;
}

// for non-prime derivation, deriving a public key from an xprv key gives
// the same answer as deriving from the matching xpub.
test("Derivation 2", function () {

  var set1 = new Bip32VectorSet( bip32VectorsSet1 );
  var set2 = new Bip32VectorSet( bip32VectorsSet2 );

  var total = set1.length() + set2.length();

  expect( total );

  derivation2set( set1 );
  derivation2set( set2 );
});

function derivation2set( set ) {
  var bip32M = new BIP32( set.get(0).xpub );

  for( var i=0 ; i < set.length() ; i++ ) {
    var vector = set.get(i);

    // Cannot do private key derivation without private key
    if (vector.isPrime() ) {
      // prime - must throw an exception
      try {
        var result = derivation2vector( bip32M, vector );
        ok( false, set.id + " :" + i + ": prime path generated a key " + vector.chain );
      } catch( e ) {
        ok( true, set.id + " :" + i + ": prime path generated an error " + vector.chain );
      }
    } else {
      // not prime - check key
      var result = derivation2vector( bip32M, vector );
      equal( result.xpub, vector.xpub, set.id + " :" + i + ": xpub " + vector.chain );
    }
  }
}

function derivation2vector( bip32M, vector ) {
    var bip32D = bip32M.derive( vector.chain );
    var xpub = bip32D.extended_public_key_string("base58");
    var result = { xpub:xpub };
  return result;
}

/*
for a couple of the keys, check that the simple public key and private
key are stable. i.e. print it out once, and add a check that it stays
the same as what you printed out. You can get those from the eckey
that's inside the BIP32 object. eckey.getHexFormat() for the private,
and eckey.getPubKeyHex.
*/

var d3_simpleKeys = {
  sprv: "CBCE0D719ECF7431D88E6A89FA1483E02E35092AF60C042B1DF2FF59FA424DCA",
  spub: "0357BFE1E341D01C69FE5654309956CBEA516822FBA8A601743A012A7896EE8DC2",
};

test("Derivation 3 stability", function () {

  expect( 2 ) ;
  var set1 = new Bip32VectorSet( bip32VectorsSet1 );
  var vector = set1.get(3);
  var bip32M = new BIP32( set1.get(0).xprv );
  var bip32D = bip32M.derive( vector.chain );

  var sprv = bip32D.eckey.getHexFormat();
  var spub = bip32D.eckey.getPubKeyHex();

  equal( sprv, d3_simpleKeys.sprv, "simple private stable" );
  equal( spub, d3_simpleKeys.spub, "simple private stable" );

  return ;
});


//--------------------------------
// test ste and vector objects
//--------------------------------

// vector
var Bip32Vector = function( values ) {
  this.chain = values[0];
  this.xpub = values[1];
  this.xprv = values[2];
}

Bip32Vector.prototype.isPrime = function() {
  return (this.chain.indexOf("'") > 0);
}

// vector set
var Bip32VectorSet = function( set ) {
  this.vectors = new Array();
  this.id = set.id;
  this.master = set.master;

  for(var index = 0 ; index < set.vectors.length ; index++) {
    var vector = new Bip32Vector( set.vectors[index] );
    this.vectors.push( vector );
  }
}

Bip32VectorSet.prototype.get = function( index ) {
  return this.vectors[ index ];
}
Bip32VectorSet.prototype.length = function() {
  return this.vectors.length;
}
