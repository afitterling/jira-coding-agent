import { en } from "~/i18n/en";
import { de } from "~/i18n/de";
import type { Locale } from "~/i18n/config";

/** The shape every locale must satisfy, derived from English. */
export type Content = typeof en;

export const dictionaries: Record<Locale, Content> = { en, de };

export type { Locale } from "~/i18n/config";
