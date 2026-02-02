import React from 'react';

interface PlateProps {
    plate: string;
    style?: 'rusty' | 'pink' | 'gold' | 'holographic' | 'wood' | 'military' | 'glow' | 'chrome' | 'transparent' | 'flames';
}

export const StyledPlate: React.FC<PlateProps> = ({ plate, style = 'rusty' }) => {
    const formatPlate = (value: string) => {
        const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (normalized.length === 7) {
            return `${normalized.slice(0, 3)}${normalized[3]}${normalized.slice(4)}`;
        }
        return normalized;
    };

    const plateText = formatPlate(plate);

    const styles = {
        rusty: {
            container: 'bg-gradient-to-br from-orange-800 via-amber-700 to-orange-900 border-4 border-orange-900',
            topBar: 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 opacity-80',
            plateText: 'text-orange-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]',
            extra: 'shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-sm',
            texture: 'bg-[url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence baseFrequency=\'0.9\' /%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.3\' /%3E%3C/svg%3E")] bg-repeat'
        },
        pink: {
            container: 'bg-gradient-to-br from-pink-400 via-pink-500 to-fuchsia-500 border-4 border-pink-300',
            topBar: 'bg-gradient-to-r from-pink-300 via-white to-pink-300',
            plateText: 'text-white drop-shadow-[0_2px_8px_rgba(236,72,153,0.8)]',
            extra: 'shadow-[0_0_30px_rgba(236,72,153,0.6)]',
            texture: 'bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent)]'
        },
        gold: {
            container: 'bg-gradient-to-br from-yellow-600 via-amber-400 to-yellow-600 border-4 border-yellow-700',
            topBar: 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600',
            plateText: 'text-yellow-950 drop-shadow-[0_2px_4px_rgba(251,191,36,0.8)] font-bold',
            extra: 'shadow-[0_0_40px_rgba(251,191,36,0.8),inset_0_0_20px_rgba(255,255,255,0.3)]',
            texture: 'bg-[linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:20px_20px] animate-[shimmer_3s_linear_infinite]'
        },
        holographic: {
            container: 'bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 border-4 border-white',
            topBar: 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400',
            plateText: 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]',
            extra: 'shadow-[0_0_30px_rgba(139,92,246,0.6)] animate-[hue-rotate_4s_linear_infinite]',
            texture: 'bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]'
        },
        wood: {
            container: 'bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 border-4 border-amber-950',
            topBar: 'bg-gradient-to-r from-blue-800 via-blue-700 to-blue-800',
            plateText: 'text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]',
            extra: 'shadow-[inset_0_0_30px_rgba(0,0,0,0.4)]',
            texture: 'bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.1)_0px,transparent_2px,transparent_6px,rgba(0,0,0,0.1)_8px)]'
        },
        military: {
            container: 'bg-gradient-to-br from-green-900 via-green-800 to-green-950 border-4 border-green-950',
            topBar: 'bg-gradient-to-r from-yellow-800 via-yellow-700 to-yellow-800',
            plateText: 'text-green-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-bold',
            extra: 'shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]',
            texture: 'bg-[url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h30v30H0z M30 30h30v30H30z\' fill=\'rgba(0,50,0,0.3)\' /%3E%3C/svg%3E")]'
        },
        glow: {
            container: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black border-4 border-cyan-400',
            topBar: 'bg-gradient-to-r from-cyan-500 via-green-400 to-cyan-500',
            plateText: 'text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.9)]',
            extra: 'shadow-[0_0_40px_rgba(74,222,128,0.7),inset_0_0_20px_rgba(74,222,128,0.2)]',
            texture: 'bg-[radial-gradient(circle_at_50%_50%,rgba(74,222,128,0.1),transparent)]'
        },
        chrome: {
            container: 'bg-gradient-to-br from-gray-300 via-gray-100 to-gray-300 border-4 border-gray-400',
            topBar: 'bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600',
            plateText: 'text-gray-800 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]',
            extra: 'shadow-[0_0_30px_rgba(200,200,200,0.8),inset_0_0_30px_rgba(255,255,255,0.5)]',
            texture: 'bg-[linear-gradient(135deg,rgba(255,255,255,0.5)_25%,transparent_50%,rgba(255,255,255,0.5)_75%)] bg-[length:30px_30px]'
        },
        transparent: {
            container: 'bg-white/20 backdrop-blur-md border-4 border-white/40',
            topBar: 'bg-blue-500/60 backdrop-blur-sm',
            plateText: 'text-gray-900 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]',
            extra: 'shadow-[0_0_30px_rgba(255,255,255,0.3),inset_0_0_20px_rgba(255,255,255,0.2)]',
            texture: 'bg-gradient-to-br from-white/10 to-transparent'
        },
        flames: {
            container: 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 border-4 border-red-700',
            topBar: 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500',
            plateText: 'text-white drop-shadow-[0_0_10px_rgba(255,100,0,0.9)] font-bold',
            extra: 'shadow-[0_0_40px_rgba(255,100,0,0.8)]',
            texture: 'bg-[url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M50 20 Q60 40 50 60 Q40 40 50 20 M70 30 Q75 45 70 60 Q65 45 70 30\' fill=\'rgba(255,100,0,0.3)\' /%3E%3C/svg%3E")] animate-[flicker_2s_ease-in-out_infinite]'
        }
    };

    const currentStyle = styles[style];

    return (
        <div className="relative">
            <div className={`relative w-full aspect-[4/1.5] rounded-lg overflow-hidden ${currentStyle.container} ${currentStyle.extra} ${currentStyle.texture}`}>
                {/* Top Bar */}
                <div className={`absolute top-0 left-0 right-0 h-[20%] ${currentStyle.topBar} flex items-center justify-between px-4`}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-6 rounded-sm bg-gradient-to-br from-green-500 via-yellow-400 to-blue-600 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">BR</span>
                        </div>
                        <span className="text-white text-sm font-bold tracking-wider">BRASIL</span>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    </div>
                </div>

                {/* Plate Number */}
                <div className="absolute inset-0 flex items-center justify-center pt-[10%]">
                    <span className={`text-5xl font-black tracking-[0.2em] ${currentStyle.plateText}`}>
                        {plateText}
                    </span>
                </div>

                {/* Bottom decoration */}
                <div className="absolute bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
        </div>
    );
};

export default StyledPlate;
