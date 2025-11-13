
export interface ExtractedFrame {
  id: string;
  base64: string;
}

export interface VideoMetadata {
  duration: string;
  resolution: string;
}

export type VideoSource = { type: 'file'; file: File } | { type: 'url'; url: string };