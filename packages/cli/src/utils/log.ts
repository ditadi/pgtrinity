import chalk from "chalk";

/**
 * Logs an error message to the console in red.
 *
 * @param message - The error message to display.
 */
export function errorLog(message: string): void {
    console.log(chalk.red(message));
}

/**
 * Logs a message to the console in green to indicate success.
 *
 * @param message - The message to display as a success log.
 */
export function successLog(message: string): void {
    console.log(chalk.green(message));
}

/**
 * Logs a warning message to the console in yellow.
 *
 * @param message - The warning message to display.
 */
export function warningLog(message: string): void {
    console.log(chalk.yellow(message));
}

/**
 * Logs an informational message to the console in cyan color.
 *
 * @param message - The message to display.
 */
export function infoLog(message: string): void {
    console.log(chalk.cyan(message));
}

/**
 * Logs a message to the console in cyan color without additional formatting.
 *
 * @param message - The message to display.
 */
export function plainLog(message: string): void {
    console.log(chalk.cyan(message));
}
