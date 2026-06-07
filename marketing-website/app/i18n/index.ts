import { en } from "~/i18n/en";
import { de } from "~/i18n/de";
import { zh } from "~/i18n/zh";
import { ms } from "~/i18n/ms";
import type { Locale } from "~/i18n/config";

/** The shape every locale must satisfy, derived from English. */
export type Content = typeof en;

export const dictionaries: Record<Locale, Content> = { en, de, zh, ms };

export type { Locale } from "~/i18n/config";
