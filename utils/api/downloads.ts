import apiClient from "@api";
import type { ViewPropApiQuery } from "types/api/common";

import { RESULTS_DOWNLOAD_ROOT_URL } from "./constants";

// TODO: Awaiting api endpoint fix - remove eslint-disable-line on completion

export async function getParallelDownloadData({
  fileName,
  queryParams,
}: ViewPropApiQuery): Promise<{ url: string; name: string } | undefined> {
  // this triggers the creation of an excel sheet of the data for the current view (table & number only) for the user to download. The sheet is generated on the backend and lives in a folder on the HDD of the server for a while and gets removed after a few days.

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const path = await apiClient.POST("/table-view/download", {
    body: { file_name: fileName, limits: {}, ...queryParams },
  });

  // example path: download/dn2_download.xlsx
  const url = `${RESULTS_DOWNLOAD_ROOT_URL}/`;
  // const url = `${RESULTS_DOWNLOAD_ROOT_URL}/${path}`;

  // Creates a unique, timestamped file name to avoid overwriting existing files on the user's computer.
  const name = `BuddhaNexus_${fileName}_${new Date()!
    .toISOString()
    .replace(/\.\w+$/, "")
    .replace(/T/, "_")
    .replace(/:/g, "-")}.xlsx`;

  return { url, name };
}
