const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const myNumbers = '0123456789';
const letters = uppercaseLetters + 'abcdefghijklmnopqrstuvwxyz';
const specialCharacters = '@#$&*%';
let password = '';
// Adiciona uma letra maiúscula
password += myNumbers[Math.floor(Math.random() * myNumbers.length)];

console.log(password)
console.log(Math.floor(Math.random() * 10))

let code
code = uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];
for(let i = 0; i < 7; i++) {
    code += Math.floor(Math.random() * 10)
}
code += uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];
console.log(code)

const generateCode = (numberOf) => {
    const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code
    code = uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];
    for(let i = 0; i < numberOf; i++) {
        code += Math.floor(Math.random() * 10)
    }
    code += uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];
}