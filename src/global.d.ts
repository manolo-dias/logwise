declare global {
    interface Log {
        info(message: string): void;
        db(message: string): void;
        debug(message: unknown): void;
        discord(message: string): void;
        error(message: unknown, object?: unknown): void;
        success(message: string): void;
        verbose(message: unknown): void;
        warn(message: string): void;
        api(message: string): void;
    }
    const log: Log;
}

export = globalThis.log;