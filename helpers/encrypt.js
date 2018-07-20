module.exports = function sha256(ascii) {
	function rightRotate(value, amount) {
		return (value>>>amount) | (value<<(32 - amount));
	};
	
	let maxWord = Math.pow(2, 32);
	let i, j; // Used as a counter across the whole file
	let result = '';

	let words = [];
	let asciiBitLength = ascii['length']*8;

	let hash = [], k = [];
	let primeCounter = 0;

	let isPrime = {};
	for (let candidate = 2; primeCounter < 64; candidate++) {
		if (!isPrime[candidate]) {
			for (i = 0; i < 313; i += candidate) {
				isPrime[i] = candidate;
			}
			hash[primeCounter] = (Math.pow(candidate, .5)*maxWord)|0;
			k[primeCounter++] = (Math.pow(candidate, 1/3)*maxWord)|0;
		}
	}
	
	ascii += '\x80'; // Append '1' bit (plus zero padding)
	while (ascii['length']%64 - 56) ascii += '\x00'; // More zero padding
	for (i = 0; i < ascii['length']; i++) {
		j = ascii.charCodeAt(i);
		if (j>>8) return; // ASCII check: only accept characters in range 0-255
		words[i>>2] |= j << ((3 - i)%4)*8;
	}
	words[words['length']] = ((asciiBitLength/maxWord)|0);
	words[words['length']] = (asciiBitLength)
	
	// process each chunk
	for (j = 0; j < words['length'];) {
		let w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
		let oldHash = hash;
		// This is now the "working hash", often labelled as letiables a...g
		// (we have to truncate as well, otherwise extra entries at the end accumulate
		hash = hash.slice(0, 8);
		
		for (i = 0; i < 64; i++) {
			let i2 = i + j;
			// Expand the message into 64 words
			// Used below if 
			let w15 = w[i - 15], w2 = w[i - 2];

			// Iterate
			let a = hash[0], e = hash[4];
			let temp1 = hash[7]
				+ (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
				+ ((e&hash[5])^((~e)&hash[6])) // ch
				+ k[i]
				// Expand the message schedule if needed
				+ (w[i] = (i < 16) ? w[i] : (
						w[i - 16]
						+ (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3)) // s0
						+ w[i - 7]
						+ (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10)) // s1
					)|0
				);
			// This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
			let temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
				+ ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj
			
			hash = [(temp1 + temp2)|0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
			hash[4] = (hash[4] + temp1)|0;
		}
		
		for (i = 0; i < 8; i++) {
			hash[i] = (hash[i] + oldHash[i])|0;
		}
	}
	
	for (i = 0; i < 8; i++) {
		for (j = 3; j + 1; j--) {
			let b = (hash[i]>>(j*8))&255;
			result += ((b < 16) ? 0 : '') + b.toString(16);
		}
	}
	return result;
};