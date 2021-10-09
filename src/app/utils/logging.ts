import {createLogger, format, transports} from 'winston'

const {json, errors, timestamp, prettyPrint, colorize, combine, printf} = format

const simplestFormat = printf(({message}) => {
  return `${message}`
})

export const log = createLogger({
  transports: [
    new transports.Console({
      level: ['dev', 'develop', 'development'].includes(process.env.NODE_ENV || '') ? 'debug' : 'info',
      format: combine(
        colorize({
          all: true,
          colors: {
            info: 'blue',
            warn: 'yellow',
            error: 'red',
            debug: 'grey',
          },
        }),
        simplestFormat
      ),
    }),
    new transports.File({
      filename: 'dxw.log',
      dirname: 'logs',
      format: combine(
        json(),
        errors({stack: true}),
        timestamp(),
        prettyPrint()
      ),
      tailable: false,
    }),
  ],
})
