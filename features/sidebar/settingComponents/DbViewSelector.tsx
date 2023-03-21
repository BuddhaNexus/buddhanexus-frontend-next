import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { atom, useSetAtom } from "jotai";
import { type DbView, VIEW_CONTEXT_OMISSIONS, views } from "utils/dbUISettings";

export const currentDbViewAtom = atom<DbView>("table");

interface Props {
  currentView: DbView;
}

export const DbViewSelector = ({ currentView }: Props) => {
  const { t } = useTranslation();
  const { sourceLanguage: lang } = useDbQueryParams();

  const { asPath, push } = useRouter();
  const setCurrentDbView = useSetAtom(currentDbViewAtom);

  const handleChange = (e: React.ChangeEvent<{ value: DbView }>) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    push(asPath.replace(currentView, e.target.value));
    setCurrentDbView(e.target.value);
  };

  return (
    <FormControl variant="filled" sx={{ width: 1, mb: 2 }}>
      <InputLabel id="db-view-selector-label">
        {t(`common:dbViewSelector.view`)}
      </InputLabel>
      <Select
        labelId="db-view-selector-label"
        id="db-view-selector"
        value={currentView}
        onChange={(e) =>
          handleChange(e as React.ChangeEvent<{ value: DbView }>)
        }
      >
        {views.map((view) => {
          if (VIEW_CONTEXT_OMISSIONS[view]?.includes(lang)) {
            return null;
          }

          return (
            <MenuItem key={view} value={view}>
              {t(`common:dbViewSelector.${view}`)}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};
