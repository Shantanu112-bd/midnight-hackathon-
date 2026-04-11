import fs from 'fs';
import path from 'path';

let cachedTxId = '';

export function getRealDeployTxId() {
  if (cachedTxId) return cachedTxId;
  try {
    const data = fs.readFileSync(path.join(process.cwd(), 'deployed-contract.json'), 'utf-8');
    const parsed = JSON.parse(data);
    cachedTxId = parsed.txId;
    return cachedTxId;
  } catch (e) {
    return '00c2e6ff3a048083cf23356ad3bb98a00afb32f524f18e6a9a517380a6a0c5e29f';
  }
}
