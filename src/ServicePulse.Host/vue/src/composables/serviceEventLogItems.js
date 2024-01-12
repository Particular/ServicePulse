import { useFetchFromServiceControl } from "./serviceServiceControlUrls";

export async function useGetEventLogItems(page, pageSize) {
  try {
    const response = await useFetchFromServiceControl(`eventlogitems?page=${page}&per_page=${pageSize}`);
    return response.json();
  } catch(err)
  {
    const result = {
      message: "error"
    };
    return result;
  }
}