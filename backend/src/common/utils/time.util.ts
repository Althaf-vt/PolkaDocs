export function parseDurationToMs(
    duration: string | number | undefined | null,
    defaultMs: number = 7 * 24 * 60 * 60 * 1000,
): number {
    if (typeof duration === 'number') {
        return duration;
    }

    if (!duration || typeof duration !== 'string') {
        return defaultMs;
    }

    const trimmed = duration.trim().toLowerCase();
    const match = trimmed.match(/^(\d+)\s*([a-z]+)?$/);
    if (!match) {
        const parsed = parseInt(trimmed, 10);
        return isNaN(parsed) ? defaultMs : parsed;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    if (!unit) {
        return value;
    }

    if (unit.startsWith('s')) return value * 1000;
    if (unit.startsWith('m') && !unit.startsWith('mo')) return value * 60 * 1000;
    if (unit.startsWith('h')) return value * 60 * 60 * 1000;
    if (unit.startsWith('d')) return value * 24 * 60 * 60 * 1000;
    if (unit.startsWith('w')) return value * 7 * 24 * 60 * 60 * 1000;
    if (unit.startsWith('mo')) return value * 30 * 24 * 60 * 60 * 1000;
    if (unit.startsWith('y')) return value * 365 * 24 * 60 * 60 * 1000;

    return defaultMs;
}
