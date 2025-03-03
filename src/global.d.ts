import { Logger } from "winston";

declare global {
    /**
     * The global logging system `logwise`, available anywhere in the project.
     * Provides modular logging functionalities.
     */
    interface Log {
        /**
         * Logs a general informational message.
         * @param message The message to be logged.
         */
        info(message: string): void;

        /**
         * Logs database-related events and transactions.
         * @param message The message to be logged.
         */
        db(message: string): void;

        /**
         * Logs detailed debugging information.
         * **Not displayed in production and never persisted.**
         * @param message Any variable to be inspected.
         */
        debug(message: unknown): void;

        /**
         * Logs Client-related events.
         * @param message The message to be logged.
         */
        client(message: string): void;

        /**
         * Logs error messages, accepting any data type.
         * You can pass a string as the first argument and an object as the second argument.
         * The second argument is optional.
         * @param message The error message or object.
         * @param object (Optional) Additional error-related data.
         */
        error(message: unknown, object?: unknown): void;

        /**
         * Logs successful events, such as completed transactions or operations.
         * @param message The message to be logged.
         */
        success(message: string): void;

        /**
         * Logs highly detailed debugging information. **Use with caution!**
         * This method provides an extensive output.
         * @param message Any variable to be inspected.
         */
        verbose(message: unknown): void;

        /**
         * Logs warning messages.
         * @param message The message to be logged.
         */
        warn(message: string): void;

        /**
         * Logs API-related events.
         * @param message The message to be logged.
         */
        api(message: string): void;
    }

    /**
     * The global instance of `logwise`, available everywhere.
     */
    const logwise: Log;
}

export default globalThis.logwise;


