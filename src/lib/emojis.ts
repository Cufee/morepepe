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

const bySlug = new Map(emojis.map((e) => [e.slug, e]));

export function getEmoji(slug: string): Emoji | undefined {
  return bySlug.get(slug);
}

export function getImageUrl(emoji: Emoji): string {
  return `/emojis/${emoji.name}`;
}

export function getFullUrl(emoji: Emoji): string {
  return `https://morepepe.com/${emoji.slug}`;
}

export function getDirectImageUrl(emoji: Emoji): string {
  return `https://morepepe.com/emojis/${emoji.name}`;
}

export function randomEmojis(count: number): Emoji[] {
  const shuffled = [...emojis].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
