// Utility for controlling plate interactions
// This handles all rules for messaging, evaluating, and reporting plates

interface PlateInteractionRecord {
    plate: string;
    userId: string;
    timestamp: string;
    type: 'message' | 'evaluation' | 'solidary' | 'report';
}

const STORAGE_KEY = 'cautoo_plate_interactions_v1';

// Get all interactions from localStorage
function getInteractions(): PlateInteractionRecord[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

// Save interactions to localStorage
function saveInteractions(interactions: PlateInteractionRecord[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(interactions));
    } catch (error) {
        console.error('Failed to save plate interactions:', error);
    }
}

// Add a new interaction
function addInteraction(
    plate: string,
    userId: string,
    type: PlateInteractionRecord['type']
): void {
    const interactions = getInteractions();
    interactions.push({
        plate,
        userId,
        timestamp: new Date().toISOString(),
        type,
    });
    saveInteractions(interactions);
}

// Check if user can evaluate a plate (24h limit)
export function canEvaluatePlate(plate: string, userId: string): {
    canEvaluate: boolean;
    reason?: string;
} {
    // Check if plate is reported
    if (isPlateReported(plate, userId)) {
        return {
            canEvaluate: false,
            reason:
                'Você denunciou esta placa. Novas interações estão bloqueadas até que a situação seja analisada pela CAUTOO.',
        };
    }

    const interactions = getInteractions();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentEvaluation = interactions.find(
        (i) =>
            i.plate === plate &&
            i.userId === userId &&
            i.type === 'evaluation' &&
            new Date(i.timestamp) > oneDayAgo
    );

    if (recentEvaluation) {
        return {
            canEvaluate: false,
            reason: 'Você já avaliou este motorista hoje. Tente novamente amanhã.',
        };
    }

    return { canEvaluate: true };
}

// Check if user can send solidary alert to a plate (one per plate permanently)
export function canSendSolidaryAlert(plate: string, userId: string): {
    canSend: boolean;
    reason?: string;
} {
    // Check if plate is reported
    if (isPlateReported(plate, userId)) {
        return {
            canSend: false,
            reason:
                'Você denunciou esta placa. Novas interações estão bloqueadas até que a situação seja analisada pela CAUTOO.',
        };
    }

    const interactions = getInteractions();

    const existingAlert = interactions.find(
        (i) =>
            i.plate === plate && i.userId === userId && i.type === 'solidary'
    );

    if (existingAlert) {
        return {
            canSend: false,
            reason:
                'Alerta solidário para esta placa já foi enviado à equipe CAUTOO. Agradecemos pela iniciativa.',
        };
    }

    return { canSend: true };
}

// Check if plate has been reported by user (permanent block)
export function isPlateReported(plate: string, userId: string): boolean {
    const interactions = getInteractions();
    return interactions.some(
        (i) =>
            i.plate === plate && i.userId === userId && i.type === 'report'
    );
}

// Check if user can send message to plate
export function canSendMessageToPlate(plate: string, userId: string): {
    canSend: boolean;
    reason?: string;
} {
    // Check if plate is reported
    if (isPlateReported(plate, userId)) {
        return {
            canSend: false,
            reason:
                'Você denunciou esta placa. Novas interações estão bloqueadas até que a situação seja analisada pela CAUTOO.',
        };
    }

    return { canSend: true };
}

// Record a message being sent
export function recordMessageSent(plate: string, userId: string): void {
    addInteraction(plate, userId, 'message');
}

// Record an evaluation
export function recordEvaluation(plate: string, userId: string): void {
    addInteraction(plate, userId, 'evaluation');
}

// Record a solidary alert
export function recordSolidaryAlert(plate: string, userId: string): void {
    addInteraction(plate, userId, 'solidary');
}

// Record a plate report (permanent block)
export function recordPlateReport(plate: string, userId: string): void {
    addInteraction(plate, userId, 'report');
}

// Get all reported plates for a user
export function getReportedPlates(userId: string): string[] {
    const interactions = getInteractions();
    return interactions
        .filter((i) => i.userId === userId && i.type === 'report')
        .map((i) => i.plate);
}
