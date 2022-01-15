import { Chalk } from 'chalk'

const color = new Chalk({ level: 2 })

export class Logger {
    loggerName: string
    verbose: boolean

    constructor(name: string, verbose?: boolean) {
        this.loggerName = name
        if (verbose) this.verbose = verbose
    }

    info(s: string) {
        console.log(`${color.gray('[')}${color.green(new Date().toISOString())}${color.gray('] [')}${color.reset(this.loggerName)}${color.gray('/')}${color.bgBlue('INFO')}${color.gray('] - ')}${color.reset(s)}`)
    } 

    warn(s: string) {
        console.log(`${color.gray('[')}${color.green(new Date().toISOString())}${color.gray('] [')}${color.reset(this.loggerName)}${color.gray('/')}${color.bgYellowBright('WARN')}${color.gray('] - ')}${color.reset(s)}`)
    } 

    error(s: string) {
        console.log(`${color.gray('[')}${color.green(new Date().toISOString())}${color.gray('] [')}${color.reset(this.loggerName)}${color.gray('/')}${color.bgRedBright('ERROR')}${color.gray('] - ')}${color.reset(s)}`)
    } 

    fatal(s: string) {
        console.log(`${color.gray('[')}${color.green(new Date().toISOString())}${color.gray('] [')}${color.reset(this.loggerName)}${color.gray('/')}${color.bgRed('FATAL')}${color.gray('] - ')}${color.reset(s)}`)
    } 

    debug(s: string) {
        if (!this.verbose) return
        console.log(`${color.gray('[')}${color.green(new Date().toISOString())}${color.gray('] [')}${color.reset(this.loggerName)}${color.gray('/')}${color.bgGray('DEBUG')}${color.gray('] - ')}${color.reset(s)}`)
    } 
}