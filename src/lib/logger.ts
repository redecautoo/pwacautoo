/**
 * Logger utility para desenvolvimento
 * Apenas loga em modo desenvolvimento, evitando logs em produção
 */

const isDev = import.meta.env.DEV;

/**
 * Obtém timestamp formatado para logs
 */
const getTimestamp = (): string => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
    });
};

export const logger = {
    /**
     * Log de informação (apenas em dev)
     */
    log: (...args: unknown[]): void => {
        if (isDev) {
            console.log(`[Cautoo ${getTimestamp()}]`, ...args);
        }
    },

    /**
     * Log de erro (apenas em dev)
     */
    error: (...args: unknown[]): void => {
        if (isDev) {
            console.error(`[Cautoo Error ${getTimestamp()}]`, ...args);
        }
    },

    /**
     * Log de aviso (apenas em dev)
     */
    warn: (...args: unknown[]): void => {
        if (isDev) {
            console.warn(`[Cautoo Warning ${getTimestamp()}]`, ...args);
        }
    },

    /**
     * Log de debug (apenas em dev)
     */
    debug: (...args: unknown[]): void => {
        if (isDev) {
            console.debug(`[Cautoo Debug ${getTimestamp()}]`, ...args);
        }
    },

    /**
     * Log de informação (apenas em dev)
     */
    info: (...args: unknown[]): void => {
        if (isDev) {
            console.info(`[Cautoo Info ${getTimestamp()}]`, ...args);
        }
    },
};

export default logger;
