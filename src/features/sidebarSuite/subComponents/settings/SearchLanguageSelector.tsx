import { useTranslation } from "next-i18next";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { SourceLanguage as SourceLanguageEnum } from "@utils/constants";
import { StringParam, useQueryParam } from "use-query-params";

const SearchLanguageSelector = () => {
  const { t } = useTranslation(["common", "settings"]);
  const { uniqueSettings } = useDbQueryParams();

  const [currentLang, setCurrentDbLang] = useQueryParam(
    uniqueSettings.queryParams.language,
    StringParam,
  );

  return (
    <FormControl variant="filled" sx={{ width: 1, mb: 2 }}>
      <InputLabel id="db-language-selector-label" sx={{ mb: 1 }}>
        {t(`settings:generic.selectLanguage`)}
      </InputLabel>
      <Select
        labelId="db-language-selector-label"
        aria-labelledby="db-language-selector-label"
        id="db-language-selector"
        value={currentLang ?? "all"}
        onChange={(e) =>
          setCurrentDbLang(
            e.target.value === "all" ? undefined : e.target.value,
          )
        }
      >
        <MenuItem key="all" value="all">
          {t(`language.all`)}
        </MenuItem>
        {Object.values(SourceLanguageEnum).map((option) => (
          <MenuItem key={option} value={option}>
            {t(`language.${option}`)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SearchLanguageSelector;
