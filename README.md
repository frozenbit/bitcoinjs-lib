# bitcoinjs-lib

A library containing Bitcoin client-side functionality in JavaScript,
most notably ECDSA signing and verification.

# Build

* git submodule init
* git submodule update
* sh build.sh


# FrozenBit improvements

BitGo made quite a few improvements, including:

* An option to configure the library to use testnet
* Sending to P2SH addresses
* Multisignature signing
* Bug fixes
* Code cleanup
* Client side transaction creation
* Use of SJCL RNG
* A build script
* Can be used both client side and server side (node.js)
* More tests

 We're building off of their progress ~ Here's what we've done.
* Added more commentation
* Fixing and minification of Bip 38
* Fixed Java Module

# Status

This is currently pretty raw code. We're planning to clean it up,
convert everything into CommonJS modules and put a flexible build
system in place.

Prototype software, use at your own peril.

# License

This library is free and open-source software released under the MIT
license.

# Copyright

BitcoinJS (c) 2011-2012 Stefan Thomas  
Released under MIT license  
http://bitcoinjs.org/

JSBN (c) 2003-2005 Tom Wu  
Released under BSD license  
http://www-cs-students.stanford.edu/~tjw/jsbn/

CryptoJS (c) 2009–2012 by Jeff Mott  
Released under New BSD license  
http://code.google.com/p/crypto-js/

node-scrypt-js (c) 2010-2011 Intalio Pte, All Rights Reserved
Released under MIT license  
https://github.com/cheongwy/node-scrypt-js

bitaddress.org (c) 2011-2012 bitaddress.org
Released under MIT license  
https://github.com/Zeilap/bitaddress.org
