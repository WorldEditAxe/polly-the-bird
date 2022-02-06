import { Chalk } from 'chalk'

const color = new Chalk({ level: 2 })

let global_verbose: boolean = false

export function verboseLogging(newVal?: boolean) {
    global_verbose = newVal ?? global_verbose ? false : true
}

export class Logger {
    loggerName: string
    verbose: boolean

    constructor(name: string, verbose?: boolean) {
        this.loggerName = name
        if (verbose) this.verbose = verbose
        else this.verbose = global_verbose
    }

    info(s: string) {
        process.stdout.write(`${color.gray('[')}${color.green(new Date().toISOString())}${color.gray('] [')}${color.reset(this.loggerName)}${color.gray('/')}${color.bgBlue('INFO')}${color.gray('] - ')}${color.reset(s)}\n`)
    } 

    warn(s: string) {
        process.stderr.write(`${color.gray('[')}${color.green(new Date().toISOString())}${color.gray('] [')}${color.reset(this.loggerName)}${color.gray('/')}${color.bgYellowBright('WARN')}${color.gray('] - ')}${color.reset(s)}\n`)
    } 

    error(s: string) {
        process.stderr.write(`${color.gray('[')}${color.green(new Date().toISOString())}${color.gray('] [')}${color.reset(this.loggerName)}${color.gray('/')}${color.bgRedBright('ERROR')}${color.gray('] - ')}${color.reset(s)}\n`)
    } 

    fatal(s: string) {
        process.stderr.write(`${color.gray('[')}${color.green(new Date().toISOString())}${color.gray('] [')}${color.reset(this.loggerName)}${color.gray('/')}${color.bgRed('FATAL')}${color.gray('] - ')}${color.reset(s)}\n`)
    } 

    debug(s: string) {
        if (!this.verbose) return
        process.stderr.write(`${color.gray('[')}${color.green(new Date().toISOString())}${color.gray('] [')}${color.reset(this.loggerName)}${color.gray('/')}${color.bgGray('DEBUG')}${color.gray('] - ')}${color.reset(s)}`)
    } 
}