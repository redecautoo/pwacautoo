import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logger from '@/lib/logger';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Captura erros em componentes React
 * Evita que toda a aplicação quebre por causa de um erro isolado
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log do erro para monitoramento
        logger.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // Aqui você pode enviar o erro para um serviço de monitoramento
        // como Sentry, LogRocket, etc.
        // Example: Sentry.captureException(error);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Você pode customizar a UI de erro aqui
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                            Oops! Algo deu errado
                        </h1>

                        <p className="text-center text-gray-600 mb-6">
                            Desculpe, encontramos um erro inesperado. Nossa equipe foi notificada.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg overflow-auto max-h-48">
                                <p className="text-sm font-mono text-red-600 mb-2">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={this.handleReset}
                                variant="outline"
                                className="flex-1"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Tentar novamente
                            </Button>

                            <Button
                                onClick={() => window.location.href = '/#/'}
                                className="flex-1"
                            >
                                Voltar ao início
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
