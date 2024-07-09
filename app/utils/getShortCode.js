import { customAlphabet } from 'nanoid'
const alphabets="1234567890abcdefghijklmnopqrstuvxyz"
const generate_code = customAlphabet(alphabets,6) //=> "V1StGXR8_Z5jdHi6B-myT"



export default generate_code;
