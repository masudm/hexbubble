//my own custom encyption implementation

//an alphabet to use since unicode has many unsupported characters (print, space, etc characters) which will take long to filter
let chars = "1234567890!\"£$%^&*()_+`¬qwertyuiop[]asdfghjkl;'#zxcvbnm,./QWERTYUIOP{}ASDFGHJKL:@~|ZXCVBNM<>?āĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨ";

function encrypt(word) {
    //hold all the details in an object
    encoded = {
        input: [],
        key: [],
        cipher: [],
    }

    //hold a local copy of the word
    let input = word;

    //go through the input and change each char into a code
    for (let i = 0; i < input.length; i++) {
        encoded.input.push(chars.indexOf(input[i]));
    }

    //generate a random key of the same length
    for (let i = 0; i < input.length; i++) {
        //a random number min and max len of chars
        let randNum = Math.floor(Math.random() * (chars.length - 1)) + 0;
        //random character
        encoded.key.push(randNum);
    }

    //xor the values of input and key
    for (let i = 0; i < input.length; i++) {
        //the caret ^ character xors in javascript
        //xor the input and key
        let xordVal = encoded.input[i] ^ encoded.key[i];
        //random character
        encoded.cipher.push(chars.split("")[xordVal]);
    }

    return encoded;
}

export function exportEncrypted(word) {
    //repeat the algo multiple random times
    let hashLevel = Math.floor(Math.random()*5) + 7;
    let inp = word;

    for (let i = 0; i <= hashLevel; i++) {
        let enc = inp.cipher;

        if (Array.isArray(enc)) {
            enc = enc.join()
        }
        
        inp = encrypt(enc);
    }

    return inp;
    //return an encoded string (sep. by |) and the key sep by ^
    //example: cipher^key 1|2|3^4|5|6
}