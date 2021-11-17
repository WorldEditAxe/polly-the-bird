export class Logger {
    loggerName: string

    constructor(name: string ) {
        this.loggerName = name
    }

    info(s: string) {
        console.log(`[${new Date().toUTCString()}] [INFO/${this.loggerName}]: ${s}`)
    } 

    warn(s: string) {
        console.warn(`[${new Date().toUTCString()}] [WARN/${this.loggerName}]: ${s}`)
    } 

    error(s: string) {
        console.error(`[${new Date().toUTCString()}] [ERROR/${this.loggerName}]: ${s}`)
    } 

    fatal(s: string) {
        console.error(`[${new Date().toUTCString()}] [FATAL/${this.loggerName}]: ${s}`)
    } 

    debug(s: string) {
        console.debug(`[${new Date().toUTCString()}] [DEBUG/${this.loggerName}]: ${s}`)
    } 
}