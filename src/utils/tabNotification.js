// Flash browser tab red when time is up
let flashInterval = null;
const originalTitle = 'Küçük Tilki';

export function startTabFlash(childName) {
  stopTabFlash();
  let show = true;
  flashInterval = setInterval(() => {
    document.title = show ? `SÜRE DOLDU! - ${childName}` : '⏰ ⏰ ⏰';
    show = !show;
  }, 800);
}

export function stopTabFlash() {
  if (flashInterval) {
    clearInterval(flashInterval);
    flashInterval = null;
  }
  document.title = originalTitle;
}

// Check if any tab flash is active
export function isFlashing() {
  return flashInterval !== null;
}
