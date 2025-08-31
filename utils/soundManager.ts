import { SOUND_FILES, MUTE_STORAGE_KEY } from '../constants';

type SoundEffect = keyof typeof SOUND_FILES;

const audioElements: Partial<Record<SoundEffect, HTMLAudioElement>> = {};
let isInitialized = false;
let globalMute = false;

const initializeSounds = () => {
  if (isInitialized) return;

  try {
    const storedMutePreference = localStorage.getItem(MUTE_STORAGE_KEY);
    if (storedMutePreference !== null) {
      globalMute = JSON.parse(storedMutePreference);
    }
  } catch (error) {
    console.warn("SoundManager: Error reading mute preference from localStorage", error);
    globalMute = false; // Default to unmuted if localStorage is problematic
  }

  (Object.keys(SOUND_FILES) as SoundEffect[]).forEach(key => {
    const audioElement = document.getElementById(`audio-${key.toLowerCase()}`) as HTMLAudioElement | null;
    if (audioElement) {
      audioElements[key] = audioElement;
      audioElement.load(); // Preload
    } else {
      console.warn(`SoundManager: Audio element for '${key}' not found.`);
    }
  });
  isInitialized = true;
};

export const playSound = (soundName: SoundEffect, volume: number = 0.7): void => {
  if (!isInitialized) {
    initializeSounds();
  }
  if (globalMute) return;

  const audioElement = audioElements[soundName];
  if (audioElement) {
    audioElement.currentTime = 0; // Rewind to start
    audioElement.volume = volume;
    audioElement.play().catch(error => {
      // Autoplay restrictions might prevent sound from playing without user interaction
    });
  }
};

export const toggleMute = (): void => {
  if (!isInitialized) initializeSounds(); // Ensure initialized before toggling
  globalMute = !globalMute;
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, JSON.stringify(globalMute));
  } catch (error) {
    console.warn("SoundManager: Error saving mute preference to localStorage", error);
  }
  if (globalMute) {
    (Object.values(audioElements) as HTMLAudioElement[]).forEach(audio => {
      if (audio) audio.pause();
    });
  }
};

export const setMute = (mute: boolean): void => {
  if (!isInitialized) initializeSounds();
  if (globalMute === mute) return; // No change
  globalMute = mute;
   try {
    localStorage.setItem(MUTE_STORAGE_KEY, JSON.stringify(globalMute));
  } catch (error) {
    console.warn("SoundManager: Error saving mute preference to localStorage", error);
  }
  if (globalMute) {
    (Object.values(audioElements) as HTMLAudioElement[]).forEach(audio => {
      if (audio) audio.pause();
    });
  }
};


export const isMuted = (): boolean => {
  if (!isInitialized) initializeSounds(); // Ensure preference is loaded before checking
  return globalMute;
};

// Initialize on script load or when first needed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSounds);
} else {
  initializeSounds(); // DOMContentLoaded has already fired
}