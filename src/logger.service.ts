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
    environment.toLowerCase() == "unset" ? console.warn(_WARNING_MESSAGE) : null;
}

const _isProduction = ['production', 'prod'].includes(environment.toLowerCase());

const _getDebugLevel = (): string => {
    return _isProduction ? 'db' : 'debug';
}
const _getEnabledLevels = (): winston.config.AbstractConfigSetLevels => {
    return _getDebugLevel() === 'db' ? {
        error: 0,
        warn: 1,
        success: 2,
        info: 3,
        client: 4,
        api: 5,
        db: 6
    } : {
        error: 0,
        warn: 1,
        success: 2,
        info: 3,
        client: 4,
        api: 5,
        db: 6,
        verbose: 7,
        debug: 8
    };
}

winston.addColors({
    success: 'green',
    info: 'white',
    warn: 'yellow',
    error: 'red',
    debug: 'gray',
    verbose: 'gray',
    api: 'cyan',
    bd: 'magenta',
    client: 'blue'
});

const loggerInstance = winston.createLogger({
    levels: _getEnabledLevels(),
    level: _getDebugLevel(),
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
                }), // 🔥 Ensure colorization works
            )
        }),
        new winston.transports.File({ filename: 'logs/server.log', level: 'db' })
    ]
});

// 🔥 Formatar os logs como uma TABELA alinhada
const toLogFormat = (timestamp: string, level: string, message: string, location: string): winston.Logform.Format => {
    return winston.format.printf(() => {

        return `${timestamp.padEnd(20)} | ${level.toUpperCase().padEnd(7)} | ${location.padEnd(25)} | ${message}`;
    });
};


const logMessage = (level: string, prefix: string, message: string): void => {
    const location = getLogLocation();

    loggerInstance.format = toLogFormat(new Date().toLocaleString(), level.toUpperCase(), prefix + message, location);
    loggerInstance[level as keyof winston.Logger](`${location} | ${prefix}${message}`);
}

const formatPrefix = (emoji: string, category?: string): string => {
    const fixedEmoji = `${emoji}\u200B`.padEnd(4, "\u200B") + "".padStart(2); // Define um tamanho fixo para o emoji (4 chars)

    if (!category) return fixedEmoji; // Prefixos sem categoria mantêm só o emoji

    const tag = `[${category}]`; // Exemplo: [API], [SUCCESS]

    return fixedEmoji + tag.padEnd(10);
}

const summarizeObject = (obj: any, depth = 1): any => {
    if (depth === 0) return "[Deep Object]";

    if (Array.isArray(obj)) {
        return obj.map(item => summarizeObject(item, depth - 1));
    }

    if (typeof obj === "object" && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, summarizeObject(value, depth - 1)])
        );
    }

    return obj;
}


class Logger {

    constructor() {
        _envInfo();
    }

    public info(message: string): void {
        const prefix = formatPrefix("🟢");
        logMessage('info', prefix, message);
    }


    public success(message: string): void {
        const prefix = formatPrefix("✅", "SUCCESS");
        logMessage('success', prefix, message);
    }


    public api(message: string): void {
        const prefix = formatPrefix("🚀", "API");
        logMessage('api', prefix, message);
    }


    public db(message: string): void {
        const prefix = formatPrefix("💾", "DB");
        logMessage('db', prefix, message);
    }


    public client(message: string): void {
        const prefix = formatPrefix("🤖", "CLIENT");
        logMessage('client', prefix, message);
    }


    public warn(message: string): void {
        const prefix = formatPrefix("🔶");
        logMessage('warn', prefix, message);
    }


    public error(message: unknown, object?: unknown): void {
        let msg = typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message);
        let error = object !== undefined ? (typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message)) : null;

        const prefix = formatPrefix("❌");
        logMessage('error', prefix, msg + (error ? ` | ${error}` : ""));
    }


    public debug(message: unknown): void {
        const prefix = formatPrefix("🐞", "DEBUG");
        if (typeof message === "string") {
            logMessage('debug', prefix, message);
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

        logMessage('debug', prefix, JSON.stringify(msg, null, 2));
    }


    public verbose(message: unknown): void {
        const prefix = formatPrefix("🔍", "VERBOSE");

        if (typeof message === "string") {
            logMessage('verbose', prefix, message);
            return;
        }

        if (typeof message !== "object" || message === null) {
            logMessage('verbose', prefix, JSON.stringify({ type: typeof message, value: message }, null, 2));
            return;
        }

        const extractDetails = (obj: any, depth = 1): any => {
            if (depth === 0) return "[Deep Object]";

            let properties: string[] = Object.getOwnPropertyNames(obj);
            let prototype = Object.getPrototypeOf(obj);

            while (prototype && prototype !== Object.prototype) {
                properties = properties.concat(Object.getOwnPropertyNames(prototype));
                prototype = Object.getPrototypeOf(prototype);
            }

            return properties.map(key => {
                const value = obj[key];

                return {
                    key,
                    type: typeof value,
                    value: (typeof value === "object" && value !== null) ? summarizeObject(value, depth - 1) : value,
                    isArray: Array.isArray(value),
                    isNull: value === null,
                    isUndefined: value === undefined,
                    constructor: value?.constructor?.name || "N/A",
                    isMethod: typeof value === "function",
                };
            });
        };

        const details = extractDetails(message);
        logMessage('verbose', prefix, JSON.stringify(details, null, 2));
    }


}



const ProxyLog: Logger = new Proxy(new Logger(), {
    get(target, prop) {
        if (typeof prop === "string" && typeof target[prop as keyof Logger] === "function") {
            return (target[prop as keyof Logger] as Function).bind(target);
        }
        return target[prop as keyof Logger];
    },
    set() {
        throw new Error("🚨 Modificação do logger não permitida!");
    }
});


if (!("logwise" in globalThis)) {
    Object.defineProperty(globalThis, "logwise", {
        value: ProxyLog,
        writable: false,
        enumerable: true,
        configurable: false
    });

} else {
    logwise.warn("Logwise já estava registrado globalmente!");
}

