import type {
  MenuOmission,
  MenuSetting,
  SettingOmissionContext,
} from "features/sidebarSuite/config/types";
import type { Script } from "features/sidebarSuite/subComponents/settings/TextScriptOption";
import { EwtsConverter } from "tibetan-ewts-converter";
import { SourceLanguage } from "utils/constants";

export const isSettingOmitted = ({
  omissions,
  settingName,
  language,
  pageContext,
}: {
  omissions: MenuOmission;
  settingName: MenuSetting;
  language: SourceLanguage;
  pageContext: SettingOmissionContext;
}) => {
  return Boolean(
    omissions?.[settingName]?.[pageContext]?.some((omittedLang) =>
      ["all", language].includes(omittedLang),
    ),
  );
};

const ewts = new EwtsConverter();
export const enscriptText = ({
  text,
  language,
  script,
}: {
  text: string;
  language: SourceLanguage;
  script: Script;
}) => {
  return script === "Wylie" && language === SourceLanguage.TIBETAN
    ? ewts.to_unicode(text)
    : text;
};

//  TODO: clarify spec - is disabling logically impossible (per include/exclude filter selections) desired behaviour? Applies to all included/excluded filters.
//
//   const [disableSelectors, setDisableSelectors] = useAtom(
//     disableLimitColectionSelectAtom
//   );

//   function setIsSelectorDisabled(
//     key: keyof QueryValues["limit_collection"],
//     value: boolean
//   ) {
//     setDisableSelectors((prevState) => {
//       const updates = {
//         excludedCategories: {},
//         excludedTexts: {},
//         includedCategories: {
//           excludedCategories: !value,
//           excludedTexts: !value,
//         },
//         includedTexts: {
//           excludedCategories: !value,
//           excludedTexts: !value,
//           includedCategories: !value,
//         },
//       };
//       return { ...prevState, ...updates[key] };
//     });
//   }
