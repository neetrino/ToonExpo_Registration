type LogLevel = 'info' | 'warn' | 'error';

type LogFields = Record<string, string | number | boolean | undefined>;

function write(level: LogLevel, message: string, fields?: LogFields): void {
  const payload = {
    level,
    message,
    ...fields,
  };

  if (process.env.NODE_ENV === 'production') {
    process.stdout.write(`${JSON.stringify(payload)}\n`);
    return;
  }

  const prefix = `[${level}] ${message}`;
  if (fields && Object.keys(fields).length > 0) {
    process.stdout.write(`${prefix} ${JSON.stringify(fields)}\n`);
  } else {
    process.stdout.write(`${prefix}\n`);
  }
}

export const logger = {
  info: (message: string, fields?: LogFields) => write('info', message, fields),
  warn: (message: string, fields?: LogFields) => write('warn', message, fields),
  error: (message: string, fields?: LogFields) => write('error', message, fields),
};
