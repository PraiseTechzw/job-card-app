const key = 'approvedByHOD';

function toSnake1(key) {
    let snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    snakeKey = snakeKey.replace(/_h_o_d/g, '_hod');
    return snakeKey;
}

function toSnake2(key) {
    return key.replace(/[A-Z]+/g, m => '_' + m.toLowerCase());
}

console.log('1:', toSnake1(key));
console.log('2:', toSnake2(key));
