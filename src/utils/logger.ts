import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} ${level}: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += '\n' + JSON.stringify(metadata, null, 2);
  }
  return msg;
});

export const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        myFormat
      )
    })
  ]
}); 