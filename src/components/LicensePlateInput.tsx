import { ChangeEvent, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface LicensePlateInputProps {
  value: string;
  onChange: (value: string) => void;
  isStolen?: boolean;
}

// Regex para validação final
const PLATE_REGEX_OLD = /^[A-Z]{3}[0-9]{4}$/; // Antiga: ABC1234
const PLATE_REGEX_MERCOSUL = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/; // Mercosul: ABC1D23

export const isValidPlate = (plate: string): boolean => {
  return PLATE_REGEX_OLD.test(plate) || PLATE_REGEX_MERCOSUL.test(plate);
};

const LicensePlateInput = ({
  value,
  onChange,
  isStolen = false
}: LicensePlateInputProps) => {
  const [isShaking, setIsShaking] = useState(false);

  // Trigger shake animation
  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  }, []);

  // Formata a placa aplicando máscara por posição
  const formatPlate = useCallback((input: string, previousValue: string): string => {
    // Converte para maiúsculo e remove caracteres não alfanuméricos
    const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, "");

    let result = "";
    let hadInvalidChar = false;

    for (let i = 0; i < cleaned.length && result.length < 7; i++) {
      const char = cleaned[i];
      const position = result.length + 1; // 1-indexed

      // Posições 1-3: apenas letras
      if (position <= 3) {
        if (/[A-Z]/.test(char)) {
          result += char;
        } else {
          hadInvalidChar = true;
        }
      }
      // Posição 4: apenas número
      else if (position === 4) {
        if (/[0-9]/.test(char)) {
          result += char;
        } else {
          hadInvalidChar = true;
        }
      }
      // Posição 5: pode ser letra (Mercosul) ou número (Antiga)
      else if (position === 5) {
        if (/[A-Z0-9]/.test(char)) {
          result += char;
        }
      }
      // Posições 6-7: apenas números
      else if (position === 6 || position === 7) {
        if (/[0-9]/.test(char)) {
          result += char;
        } else {
          hadInvalidChar = true;
        }
      }
    }

    // Trigger shake if user tried to type invalid char and input didn't grow
    if (hadInvalidChar && result.length <= previousValue.length) {
      triggerShake();
    }

    return result;
  }, [triggerShake]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPlate(e.target.value, value);
    onChange(formatted);
  };

  const isPlaceholder = !value;
  const isComplete = value.length === 7;
  const isValid = useMemo(() => isValidPlate(value), [value]);

  // Detecta formato baseado na posição 5
  const detectedFormat = useMemo(() => {
    if (value.length >= 5) {
      const fifthChar = value[4];
      if (/[A-Z]/.test(fifthChar)) return "Mercosul";
      if (/[0-9]/.test(fifthChar)) return "Antiga";
    }
    return null;
  }, [value]);

  return (
    <div className="w-full">
      <label className="block text-sm text-muted-foreground mb-3 text-center">
        Digite a placa do veículo
      </label>

      <motion.div
        className={`relative w-full rounded-xl overflow-hidden border-2 transition-colors shadow-lg ${isStolen
            ? "border-red-500 shadow-red-500/30"
            : isComplete && isValid
              ? "border-primary shadow-primary/20"
              : value.length > 0
                ? "border-amber-500/50 shadow-amber-500/10"
                : "border-border"
          } ${isShaking ? "animate-shake" : ""}`}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        {/* Badge de ROUBADO */}
        {isStolen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 right-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
          >
            ROUBADO
          </motion.div>
        )}

        {/* Blue header with BRASIL */}
        <div className="bg-[#003399] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xs">🇧🇷</span>
            </div>
            <span className="text-xs font-bold text-white tracking-widest">BRASIL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          </div>
        </div>

        {/* Plate body */}
        <div className="bg-[#f5f5f5] dark:bg-[#e8e8e8] px-4 py-6 sm:py-8 relative">
          {/* Decorative corners */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-gray-300 rounded-tl-sm"></div>
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-gray-300 rounded-tr-sm"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-gray-300 rounded-bl-sm"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-gray-300 rounded-br-sm"></div>

          <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="ABC1D23"
            className={`w-full text-center text-3xl sm:text-5xl font-black tracking-[0.12em] sm:tracking-[0.15em] bg-transparent border-none outline-none uppercase ${isPlaceholder ? "text-gray-300 placeholder:text-gray-300" : "text-gray-900"
              }`}
            style={{
              fontFamily: "'FE-Schrift', 'Oswald', sans-serif",
              textShadow: isPlaceholder ? 'none' : '1px 1px 0 rgba(0,0,0,0.1)'
            }}
            maxLength={7}
            autoCapitalize="characters"
            inputMode="text"
          />
        </div>

        {/* Bottom accent line */}
        <div className="h-1 bg-gradient-to-r from-green-500 via-yellow-400 to-green-500"></div>
      </motion.div>

      {/* Status indicator */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <div className="flex gap-1">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i < value.length
                  ? (isComplete && isValid)
                    ? "bg-primary"
                    : "bg-amber-500"
                  : "bg-muted"
                }`}
              initial={false}
              animate={{
                scale: i === value.length - 1 && value.length > 0 ? [1, 1.3, 1] : 1
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
        <span className={`text-xs ${(isComplete && isValid) ? "text-primary" : "text-muted-foreground"}`}>
          {value.length}/7
          {detectedFormat && value.length >= 5 && (
            <span className="ml-1 text-muted-foreground">({detectedFormat})</span>
          )}
        </span>
      </div>

      {/* Hint/validation message */}
      {(!isComplete || !isValid) && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Digite uma placa válida: <span className="font-medium">ABC1234</span> ou <span className="font-medium">ABC1D23</span>
        </p>
      )}

      {/* Success indicator when valid */}
      {isComplete && isValid && (
        <motion.p
          className="text-xs text-primary text-center mt-2 font-medium"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✓ Placa válida ({detectedFormat})
        </motion.p>
      )}
    </div>
  );
};

export default LicensePlateInput;