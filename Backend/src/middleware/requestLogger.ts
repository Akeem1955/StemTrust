import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const logFilePath = path.join(process.cwd(), 'server.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, body, query } = req;
  const timestamp = new Date().toISOString();

  // Sanitize body to remove sensitive info like passwords
  const sanitizedBody = { ...body };
  if (sanitizedBody.password) sanitizedBody.password = '***';
  if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '***';

  // Log Request
  const requestLog = `[${timestamp}] REQUEST: ${method} ${url} | Query: ${JSON.stringify(query)} | Body: ${JSON.stringify(sanitizedBody)}`;
  
  console.log(requestLog);
  logStream.write(requestLog + '\n');

  // Capture response body
  const originalSend = res.send;
  let responseBody: any;

  res.send = function (body) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  // Hook into response finish to log outcome
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Try to parse if it's a stringified JSON
    let loggedBody = responseBody;
    try {
        if (typeof responseBody === 'string') {
            loggedBody = JSON.parse(responseBody);
        }
    } catch (e) {
        // keep as is
    }

    // Sanitize response if needed (e.g. tokens)
    // For now, we'll just log it. Be careful with large responses in production.
    const responseLog = `[${new Date().toISOString()}] RESPONSE: ${method} ${url} | Status: ${statusCode} | Duration: ${duration}ms | Body: ${JSON.stringify(loggedBody)}`;
    
    console.log(responseLog);
    logStream.write(responseLog + '\n');
  });

  next();
};
