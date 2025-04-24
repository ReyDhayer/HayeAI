// Script Node.js para gerar certificados SSL locais usando devcert (npm install devcert)
const devcert = require('devcert');
const fs = require('fs');

(async () => {
  console.log('Gerando certificados SSL locais com devcert...');
  const { key, cert } = await devcert.certificateFor('localhost');
  fs.writeFileSync('key.pem', key);
  fs.writeFileSync('cert.pem', cert);
  console.log('Certificados key.pem e cert.pem gerados com sucesso!');
})();
