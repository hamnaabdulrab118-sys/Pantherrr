export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  colors: string[];
}

export interface GiftData {
  id: string;
  title: string;
  theme: string;
  flowers: string[];
  wrapStyle: string;
  natureElements: string[];
  charms: string[];
  photoUrl: string;
  photoCaption: string;
  videoUrl?: string;
  videoCaption?: string;
  voiceNoteUrl?: string;
  voiceNoteDuration?: number;
  songUrl?: string;
  songTitle?: string;
  songArtist?: string;
  backgroundMusic?: string;
  musicPreset?: string;
  musicAudioUrl?: string;
  moodTag?: string;
  captainsLog: string;
  captainsLogImage?: string;
  bouquetLetter?: string;
  coverImage?: string;
  locketPhoto: string;
  locketCaption: string;
  distanceMiles: number;
  fromCity: string;
  toCity: string;
  fromCoords?: { lat: number; lon: number };
  toCoords?: { lat: number; lon: number };
  fromPerson: string;
  toPerson: string;
  letter: string;
  date: string;
  published: boolean;
  shareCode?: string;
  enabledSlides?: number[];
  chatMessages?: ChatMessage[];
  pantherGpsTrackingEnabled?: boolean;
  lastEditedDate?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'dino' | 'moon' | 'panther';
  text: string;
  image?: string;
  time?: string;
  heartCount?: number;
}

export type ActiveTab = 'home' | 'builder' | 'gallery' | 'letters' | 'settings' | 'viewer';
