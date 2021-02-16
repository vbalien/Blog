import loadable from "@loadable/component";

type AsyncPageProps = {
  page: string;
};
const AsyncPage = loadable<AsyncPageProps>(
  props => import(`pages/${props.page}`)
);

export default AsyncPage;
