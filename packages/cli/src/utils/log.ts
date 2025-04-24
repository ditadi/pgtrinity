import chalk from "chalk";

/**
 * Log a error message
 */
export function errorLog(message: string): void {
    console.log(chalk.red(message));
}

/**
 * Log a success message
 */
export function successLog(message: string): void {
    console.log(chalk.green(message));
}

/**
 * Log a warning message
 */
export function warningLog(message: string): void {
    console.log(chalk.yellow(message));
}

/**
 * Log a info message
 */
export function infoLog(message: string): void {
    console.log(chalk.cyan(message));
}

/**
 * Log a plain message
 */
export function plainLog(message: string): void {
    console.log(chalk.cyan(message));
}
