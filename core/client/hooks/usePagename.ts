import { useParams } from "react-router-dom";
import normalizePagename from "core/utils/normalizePagename";

export default function usePagename(): string {
  const { page: pagename } = useParams<{ page: string }>();
  return normalizePagename(pagename);
}
