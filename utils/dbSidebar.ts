import type { DbView } from "@components/db/DbViewSelector";
import { atom } from "jotai";

const dbLangs = ["pli", "chn", "tib", "skt"] as const;
export type DbLang = (typeof dbLangs)[number];

const filterList = [
  "co_occ",
  "limit_collection",
  "par_length",
  "score",
  "target_collection",
] as const;

const queriedDisplayOptionList = [
  "folio",
  "multi_lingual",
  "sort_method",
] as const;

const localDisplayOptionList = ["script", "showAndPositionSegmentNrs"] as const;

const utilityOptionList = [
  "download",
  "copyQueryTitle",
  "copyQueryLink",
  "emailQueryLink",
] as const;

export const resourceLinksOptionKey = "resourceLinks";

export type Filter = (typeof filterList)[number];
export type QueriedDisplayOption = (typeof queriedDisplayOptionList)[number];
export type LocalDisplayOption = (typeof localDisplayOptionList)[number];
export type DisplayOption = LocalDisplayOption | QueriedDisplayOption;
export type UtilityOption = (typeof utilityOptionList)[number];

type ViewOmission = (DbLang | "allLangs")[];
type SettingContext = Partial<Record<DbView, ViewOmission>>;

export type FilterOmissions = Partial<Record<Filter, SettingContext>>;
export const FILTER_CONTEXT_OMISSIONS: FilterOmissions = {
  limit_collection: { graph: ["allLangs"] },
  target_collection: {
    numbers: ["allLangs"],
    table: ["allLangs"],
    text: ["allLangs"],
  },
};

const QUERIED_DISPLAY_OPTIONS_CONTEXT_OMISSIONS: Partial<
  Record<QueriedDisplayOption, SettingContext>
> = {
  folio: {
    // "folio" is used as "jump to" in text view and "only show" in other applicable views
    graph: ["allLangs"],
  },
  multi_lingual: {
    graph: ["allLangs"],
    numbers: ["allLangs"],
    table: ["allLangs"],
  },
  sort_method: {
    graph: ["allLangs"],
    numbers: ["allLangs"],
    text: ["allLangs"],
  },
};

const LOCAL_DISPLAY_OPTIONS_CONTEXT_OMISSIONS: Partial<
  Record<LocalDisplayOption, SettingContext>
> = {
  script: {
    graph: ["allLangs"],
    numbers: ["allLangs"],
    table: ["pli", "chn", "skt"],
    text: ["pli", "chn", "skt"],
  },
  showAndPositionSegmentNrs: {
    graph: ["allLangs"],
    numbers: ["allLangs"],
    table: ["allLangs"],
  },
};

export type DisplayOmissions = Partial<
  Record<LocalDisplayOption | QueriedDisplayOption, SettingContext>
>;
export const DISPLAY_OPTIONS_CONTEXT_OMISSIONS: DisplayOmissions = {
  ...QUERIED_DISPLAY_OPTIONS_CONTEXT_OMISSIONS,
  ...LOCAL_DISPLAY_OPTIONS_CONTEXT_OMISSIONS,
};

export type UtilityOmissions = Partial<Record<UtilityOption, SettingContext>>;
export const UTILITY_OPTIONS_CONTEXT_OMISSIONS: UtilityOmissions = {
  download: {
    graph: ["allLangs"],
    text: ["allLangs"],
  },
};

export const TEMP_EXTERNAL_TEXT_LINKS: Record<DbLang, string[]> = {
  // TODO: clarify external link sources & applications
  pli: ["SC", "VRI"],
  skt: ["GRETIL", "DSBC"],
  tib: ["BDRC", "RKTS"],
  chn: ["CBETA", "SC", "CBC"],
};

type Omission = Partial<
  Record<
    Filter | LocalDisplayOption | QueriedDisplayOption | UtilityOption,
    SettingContext
  >
>;

export const isSettingOmitted = ({
  omissions,
  settingName,
  dbLang,
  view,
}: {
  omissions: Omission;
  settingName: DisplayOption | Filter | UtilityOption;
  dbLang: DbLang;
  view: DbView;
}) => {
  if (
    omissions?.[settingName]?.[view]?.some((ommittedLang) =>
      ["allLangs", dbLang].includes(ommittedLang)
    )
  ) {
    return true;
  }

  return false;
};

export const QUERY_DEFAULTS = {
  co_occ: 30,
  score: 30,
  par_length: { tib: 14, chn: 7, pli: 30, skt: 30 },
  limit_collection: undefined,
  target_collection: undefined,
  folio: undefined,
  sort_method: undefined,
} as const;

export const MIN_PAR_LENGTH_VALUES = { tib: 7, chn: 5, pli: 25, skt: 25 };

export const DEFAULT_QUERY_SETTING_VALUES = {
  ...QUERY_DEFAULTS,
  limit_collection: {
    excludedCategories: [],
    excludedFiles: [],
    includedCategories: [],
    includedFiles: [],
  },
};

export const querySettingsValuesAtom = atom(DEFAULT_QUERY_SETTING_VALUES);