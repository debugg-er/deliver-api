const letters = 'abcdefghijklmnopqrstuvxyzABCDEFGHIJKLMNOPQRSTUVXYZ1234567890';

export default function randomstring(length: number) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += letters[~~(Math.random() * letters.length)];
    }
    return result;
}
