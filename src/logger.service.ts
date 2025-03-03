import * as winston from 'winston';
import * as path from "path";
import * as dotenv from 'dotenv';
dotenv.config();
const environment = process.env.NODE_ENV || process.env.APP_ENV || process.env.ENVIRONMENT || process.env.STAGE || 'unset';

// 🔍 Função para capturar a linha e o arquivo de onde o log foi chamado
const getLogLocation = (): string => {
    const error = new Error();
    if (!error.stack) return "";

    const stack = error.stack.split('\n').map(line => line.trim());

    // 🔍 Ignora chamadas internas do logger e do Winston
    const callerLine = stack.find(line =>
        line.startsWith('at ') &&
        !line.includes('node_modules') &&
        !line.includes('logger.service') &&
        !line.includes('winston')
    );

    if (!callerLine) return "";

    // 🛠️ Extraímos caminho do arquivo e número da linha
    const match = callerLine.match(/\((.*):(\d+):(\d+)\)$/) || callerLine.match(/at (.*):(\d+):(\d+)$/);
    if (!match) return "";

    const [, filePath, line] = match;

    return `${path.basename(filePath)}:${line}`;
}



const _envInfo = (): void => {
    const _WARNING_MESSAGE =
        `
█████████████████████████████████████████████████████████████████
█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
█ ⚠️ **WARNING! WORKING ENVIRONMENT  VARIABLES ARE NOT SET!** ⚠️  █
█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█
█ 🛑 DEBUG and VERBOSE were disabled for secutiry reasons    🛑 █
█ 🛑 Please, set it into .env so you can use this methods    🛑 █
█████████████████████████████████████████████████████████████████`
    environment.toLowerCase() == "unset" ? logwise.warn(_WARNING_MESSAGE) : null;
}

/**
* Default log for messages. 
* @param message Log message.
*/
export class Logger {
    private static instance: winston.Logger;
    private static isProduction = ['production', 'prod'].includes(environment.toLowerCase());
    private static _getDebugLevel(): string {
        return this.isProduction ? 'db' : 'debug';
    }
    private static _getEnabledLevels(): winston.config.AbstractConfigSetLevels {
        return this._getDebugLevel() === 'db' ? {
            error: 0,
            warn: 1,
            success: 2,
            info: 3,
            discord: 4,
            api: 5,
            db: 6
        } : {
            error: 0,
            warn: 1,
            success: 2,
            info: 3,
            discord: 4,
            api: 5,
            db: 6,
            verbose: 7,
            debug: 8
        };
    }



    private static getLogger(): winston.Logger {
        if (!this.instance) {
            this.instance = winston.createLogger({
                levels: this._getEnabledLevels(),
                level: this._getDebugLevel(),
                transports: [
                    new winston.transports.Console({
                        format: winston.format.combine(
                            winston.format.colorize({
                                all: true,
                                colors: {
                                    success: 'green',
                                    info: 'white',
                                    warn: 'yellow',
                                    error: 'red',
                                    debug: 'gray',
                                    verbose: 'gray',
                                    api: 'cyan',
                                    db: 'magenta',
                                    discord: 'blue'
                                }
                            }),
                        )
                    }),
                    new winston.transports.File({ filename: 'logs/server.log', level: 'db' })
                ]
            });

            winston.addColors({
                success: 'green',
                info: 'white',
                warn: 'yellow',
                error: 'red',
                debug: 'gray',
                verbose: 'gray',
                api: 'cyan',
                bd: 'magenta',
                discord: 'blue'
            });
        }
        return this.instance;
    }



    // 🔥 Formatar os logs como uma TABELA alinhada
    private static readonly toLogFormat = (timestamp: string, level: string, message: string, location: string): winston.Logform.Format => {
        return winston.format.printf(() => {

            return `${timestamp.padEnd(20)} | ${level.toUpperCase().padEnd(7)} | ${location.padEnd(25)} | ${message}`;
        });
    };



    private static logMessage(level: string, prefix: string, message: string): void {
        const location = getLogLocation();

        this.getLogger().format = this.toLogFormat(new Date().toLocaleString(), level.toUpperCase(), prefix + message, location);
        this.getLogger()[level as keyof winston.Logger](`${location} | ${prefix}${message}`);
    }

    private static formatPrefix(emoji: string, category?: string): string {
        const fixedEmoji = `${emoji}\u200B`.padEnd(4, "\u200B") + "".padStart(2); // Define um tamanho fixo para o emoji (4 chars)

        if (!category) return fixedEmoji; // Prefixos sem categoria mantêm só o emoji

        const tag = `[${category}]`; // Exemplo: [API], [SUCCESS]

        return fixedEmoji + tag.padEnd(10);
    }


    static info(message: string): void {
        const prefix = this.formatPrefix("🟢");
        this.logMessage('info', prefix, message);
    }


    static success(message: string): void {
        const prefix = this.formatPrefix("✅", "SUCCESS");
        this.logMessage('success', prefix, message);
    }


    static api(message: string): void {
        const prefix = this.formatPrefix("🚀", "API");
        this.logMessage('api', prefix, message);
    }


    static db(message: string): void {
        const prefix = this.formatPrefix("💾", "DB");
        this.logMessage('db', prefix, message);
    }


    static discord(message: string): void {
        const prefix = this.formatPrefix("🤖", "CLIENT");
        this.logMessage('discord', prefix, message);
    }


    static warn(message: string): void {
        const prefix = this.formatPrefix("🔶");
        this.logMessage('warn', prefix, message);
    }


    static error(message: unknown, object?: unknown): void {
        let msg = typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message);
        let error = object !== undefined ? (typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message)) : null;

        const prefix = this.formatPrefix("❌");
        this.logMessage('error', prefix, msg + (error ? ` | ${error}` : ""));
    }


    static debug(message: unknown): void {
        const prefix = this.formatPrefix("🐞", "DEBUG");
        if (typeof message === "string") {
            this.logMessage('debug', prefix, message);
            return;
        }
        const msg = (typeof message === "object" && message !== null)
            ? Object.entries(message).map(([key, value]) => ({
                key,
                type: typeof value,
                value: (typeof value === "object" && value !== null) ? "[Object]" : value,
                isMethod: typeof value === "function"
            }))
            : [];

        this.logMessage('debug', prefix, JSON.stringify(msg, null, 2));
    }

    static verbose(message: unknown): void {
        const prefix = this.formatPrefix("🔍", "VERBOSE");
        if (typeof message === "string") {
            this.logMessage('verbose', prefix, message);
            return;
        }

        const details = (typeof message === "object" && message !== null)
            ? Object.entries(message).map(([key, value]) => ({
                key,
                type: typeof value,
                value: (typeof value === "object" && value !== null) ? this.summarizeObject(value, 1) : value,
                isArray: Array.isArray(value),
                isNull: value === null,
                isUndefined: value === undefined,
                constructor: value?.constructor?.name || "N/A",
                valueLength: (typeof value === "string" || Array.isArray(value)) ? value.length : undefined,
                isMethod: typeof value === "function",
                methodDetails: (typeof value === "function") ? value.toString() : undefined
            })) : [];
        const msg = JSON.stringify(details, null, 2)
        this.logMessage('verbose', prefix, msg);
    }

    private static summarizeObject(obj: any, depth = 1): any {
        if (depth === 0) return "[Deep Object]";

        if (Array.isArray(obj)) {
            return obj.map(item => this.summarizeObject(item, depth - 1));
        }

        if (typeof obj === "object" && obj !== null) {
            return Object.fromEntries(
                Object.entries(obj).map(([key, value]) => [key, this.summarizeObject(value, depth - 1)])
            );
        }

        return obj;
    }
}



Object.defineProperty(globalThis, "log", {
    value: Logger,
    writable: false,
    enumerable: true,
    configurable: false
});