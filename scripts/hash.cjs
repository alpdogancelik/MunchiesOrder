const { scryptSync, randomBytes } = require('crypto');
function hash(p) { const salt = randomBytes(16).toString('hex'); const buf = scryptSync(p, salt, 64); return `${buf.toString('hex')}.${salt}`; }
console.log('owner=' + hash('owner123'));
console.log('student=' + hash('student123'));
console.log('courier=' + hash('courier123'));
