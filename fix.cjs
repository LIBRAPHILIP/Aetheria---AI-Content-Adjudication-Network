const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

lines[426] = '      toast.error("Please provide all required claim variables.");';
lines[507] = '      toast.success("Preparing document generation...");';
lines[887] = '      toast.success("Adjudication report PDF generated & downloaded successfully!");';
lines[891] = '      toast.error("Could not generate PDF report. Verification error.");';
lines[2302] = '                        onClick={() => toast.success("Pro Studio checkout triggered over simulated gateway.")}';
lines[2336] = '                        onClick={() => toast.success("Connected agent-wallet to coordinate recurring licensing contracts.")}';
lines[2651] = '                          onClick={() => toast.success(`Consensus economic scenario cached! Token lockup velocity: ${(( (montyDisputes * 50) + (montyCertifications * 15) )).toLocaleString()} GEN.`)}';

fs.writeFileSync('src/App.tsx', lines.join('\n'));
console.log('Fixed');
