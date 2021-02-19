import paginationState from "core/store/paginationState";
import { PaginationApi } from "core/writeApis";
import { useParams } from "react-router-dom";
import { Loadable, useRecoilValueLoadable } from "recoil";
import normalizePagename from "core/utils/normalizePagename";

export default function usePaginationLoadable(): Loadable<PaginationApi> {
  let { page: apiPath } = useParams<{ page: string }>();
  apiPath = normalizePagename(apiPath, { ignorePaginator: true }).replace(
    /index$/i,
    "1"
  );
  const pagination = useRecoilValueLoadable(paginationState(apiPath));
  return pagination;
}
