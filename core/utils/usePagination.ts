import { PaginationApi } from "core/collectPages";
import paginationState from "core/store/paginationState";
import { useParams } from "react-router-dom";
import { Loadable, useRecoilValueLoadable } from "recoil";
import normalizePagename from "./normalizePagename";

export default function usePaginationLoadable(): Loadable<PaginationApi> {
  let { page: apiPath } = useParams<{ page: string }>();
  apiPath = normalizePagename(apiPath).replace(/index$/i, "1");
  const pagination = useRecoilValueLoadable(paginationState(apiPath));
  return pagination;
}
