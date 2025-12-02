import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import util from 'util';

// Setup error logging to debugging.log
const logFile = path.join(process.cwd(), 'debugging.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

const originalConsoleError = console.error;
console.error = function (...args: any[]) {
  const timestamp = new Date().toISOString();
  const message = util.format(...args);
  logStream.write(`[${timestamp}] ERROR: ${message}\n`);
  originalConsoleError.apply(console, args);
};

import app from './app';
import { initSmartContract } from './services/smartContract';

// Initialize smart contract service after dotenv is loaded
initSmartContract();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
