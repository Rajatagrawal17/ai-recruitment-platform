import confetti from 'canvas-confetti';

export function celebrateApply() {
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { x: 0.5, y: 0.6 },
    colors,
    zIndex: 9999
  });
  setTimeout(() => confetti({
    particleCount: 40,
    angle: 60,
    spread: 70,
    origin: { x: 0.3, y: 0.7 },
    colors,
    zIndex: 9999
  }), 200);
  setTimeout(() => confetti({
    particleCount: 40,
    angle: 120,
    spread: 70,
    origin: { x: 0.7, y: 0.7 },
    colors,
    zIndex: 9999
  }), 400);
}

export function celebrateProfile() {
  confetti({
    particleCount: 60,
    spread: 80,
    origin: { x: 0.5, y: 0.5 },
    shapes: ['star'],
    colors: ['#6366f1', '#8b5cf6', '#ffd700'],
    zIndex: 9999
  });
}
