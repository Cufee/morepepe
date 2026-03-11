import data from "@/data/emojis.json";
import stats from "@/data/stats.json";

export interface Emoji {
  slug: string;
  name: string;
  displayName: string;
  description: string;
  tags: string[];
  width: number;
  height: number;
  fileSize: number;
  fileSizeHuman: string;
  fileType: string;
  ext: string;
}

export const emojis: Emoji[] = data as Emoji[];
export const siteStats = stats as {
  total: number;
  png: number;
  gif: number;
  zipSize: number;
  zipSizeHuman: string;
};

const SITE = "https://morepepe.com";
const bySlug = new Map(emojis.map((e) => [e.slug, e]));

export function getEmoji(slug: string): Emoji | undefined {
  return bySlug.get(slug);
}

export function getImageUrl(emoji: Emoji): string {
  return `/emojis/${emoji.name}`;
}

export function getDirectImageUrl(emoji: Emoji): string {
  return `${SITE}/emojis/${emoji.name}`;
}

export function randomEmojis(count: number): Emoji[] {
  const arr = [...emojis];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}
