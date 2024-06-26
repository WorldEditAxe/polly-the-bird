import { Chalk } from 'chalk';
const color = new Chalk({ level: 2 });
let global_verbose = false;
export function verboseLogging(newVal) {
    global_verbose = (newVal !== null && newVal !== void 0 ? newVal : global_verbose) ? false : true;
}
export class Logger {
    constructor(name, verbose) {
        this.loggerName = name;
        if (verbose)
            this.verbose = verbose;
        else
            this.verbose = global_verbose;
    }
    info(s) {
        process.stdout.write(`${color.gray('[')}${color.green(new Date().toISOString())}${color.gray('] [')}${color.reset(this.loggerName)}${color.gray('/')}${color.bgBlue('INFO')}${color.gray('] - ')}${color.reset(s)}\n`);
    }
    warn(s) {
        process.stderr.write(`${color.gray('[')}${color.green(new Date().toISOString())}${color.gray('] [')}${color.reset(this.loggerName)}${color.gray('/')}${color.bgYellowBright('WARN')}${color.gray('] - ')}${color.reset(s)}\n`);
    }
    error(s) {
        process.stderr.write(`${color.gray('[')}${color.green(new Date().toISOString())}${color.gray('] [')}${color.reset(this.loggerName)}${color.gray('/')}${color.bgRedBright('ERROR')}${color.gray('] - ')}${color.reset(s)}\n`);
    }
    fatal(s) {
        process.stderr.write(`${color.gray('[')}${color.green(new Date().toISOString())}${color.gray('] [')}${color.reset(this.loggerName)}${color.gray('/')}${color.bgRed('FATAL')}${color.gray('] - ')}${color.reset(s)}\n`);
    }
    debug(s) {
        if (!this.verbose)
            return;
        process.stderr.write(`${color.gray('[')}${color.green(new Date().toISOString())}${color.gray('] [')}${color.reset(this.loggerName)}${color.gray('/')}${color.bgGray('DEBUG')}${color.gray('] - ')}${color.reset(s)}\n`);
    }
}
//# sourceMappingURL=logger.js.map