import type { Script } from "@features/sidebarSuite/subComponents/settings/TextScriptOption";
import { DbViewEnum, DEFAULT_DB_VIEW, SourceLanguage } from "@utils/constants";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

/**
 * GENERAL
 */

export const currentViewAtom = atom<DbViewEnum>(DEFAULT_DB_VIEW);

/**
 * SETTINGS SIDEBAR
 */
export const isNavigationDrawerOpen = atom(false);
export const scriptSelectionAtom = atomWithStorage<Script>(
  "text-script-selection",
  "Unicode",
);
export const isSettingsOpenAtom = atom(true);
export const defaultSourceLanguagesSelection = atom<SourceLanguage[]>([]);

/**
 * TEXT VIEW
 */
export const textViewFilterComparisonAtom = atom<string | undefined>(undefined);
export const shouldShowSegmentNumbersAtom = atomWithStorage<boolean>(
  "shouldShowSegmentNumbers",
  true,
);
export const shouldUseMonochromaticSegmentColorsAtom = atomWithStorage<boolean>(
  "shouldUseMonochromaticSegmentColors",
  false,
);

export const selectedSegmentMatchesAtom = atom<string[]>([]);
