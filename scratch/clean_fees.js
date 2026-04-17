import fs from 'fs';
import path from 'path';

const DATA_DIR = './data';
const feesPath = path.join(DATA_DIR, 'fees.json');

if (fs.existsSync(feesPath)) {
  const fees = JSON.parse(fs.readFileSync(feesPath, 'utf-8'));
  const cleanedFees = fees.map(f => {
    const { tuitionFee, examFee, libraryFee, sportsFee, totalFee, ...rest } = f;
    return rest;
  });
  fs.writeFileSync(feesPath, JSON.stringify(cleanedFees, null, 2));
  console.log('Cleaned fees.json successfully');
} else {
  console.log('fees.json not found');
}
