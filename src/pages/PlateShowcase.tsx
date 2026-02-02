import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StyledPlate } from '@/components/PlateStyles';
import { PageTransition } from '@/components/PageTransition';

const PlateShowcase = () => {
    const navigate = useNavigate();

    const plates = [
        { style: 'rusty' as const, name: '🦀 Enferrujada', description: 'Vintage oxidada' },
        { style: 'pink' as const, name: '💗 Rosa Chiclete', description: 'Moderno vibrante' },
        { style: 'gold' as const, name: '🏆 Ouro Premium', description: 'Luxury brilhante' },
        { style: 'holographic' as const, name: '🌈 Holográfica', description: 'Iridescente futurista' },
        { style: 'wood' as const, name: '🪵 Madeira Rústica', description: 'Textura natural' },
        { style: 'military' as const, name: '🎖️ Militar Camo', description: 'Camuflagem tática' },
        { style: 'glow' as const, name: '✨ Glow Dark', description: 'Brilha no escuro' },
        { style: 'chrome' as const, name: '💎 Cromada', description: 'Espelhada metálica' },
        { style: 'transparent' as const, name: '🧊 Transparente', description: 'Acrílico vidro' },
        { style: 'flames' as const, name: '🔥 Flames', description: 'Hot rod fogo' },
    ];

    return (
        <PageTransition>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 sticky top-0 z-10 shadow-lg">
                    <div className="max-w-6xl mx-auto flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/20">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">🎨 Showcase de Placas</h1>
                            <p className="text-sm text-white/80">10 estilos visuais únicos de placas Mercosul</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-6xl mx-auto p-6">
                    {/* Info Banner */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-lg border border-purple-200 dark:border-purple-900">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            📌 Demonstração de Capacidade
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Estes 10 layouts de placas foram criados apenas para demonstração.
                            Cada um mantém o padrão Mercosul (ABC1D23) mas com estilos visuais completamente diferentes.
                            <span className="block mt-2 text-purple-600 dark:text-purple-400 font-semibold">
                                ⚠️ Estes designs não serão usados no app de produção.
                            </span>
                        </p>
                    </div>

                    {/* Grid de Placas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {plates.map((plate, index) => (
                            <div
                                key={plate.style}
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                            >
                                {/* Nome e Descrição */}
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                        {plate.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {plate.description}
                                    </p>
                                </div>

                                {/* Placa */}
                                <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6">
                                    <StyledPlate plate="ABC1D23" style={plate.style} />
                                </div>

                                {/* Badge de número */}
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Estilo #{index + 1} de 10
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                                        {plate.style.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Info */}
                    <div className="mt-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white text-center">
                        <p className="text-lg font-semibold mb-2">
                            ✨ Todos os 10 estilos foram criados com CSS puro
                        </p>
                        <p className="text-sm text-white/90">
                            Sem imagens externas • Responsivo • Leve • Performance otimizada
                        </p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default PlateShowcase;
