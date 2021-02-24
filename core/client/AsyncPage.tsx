import loadable from "@loadable/component";

type AsyncPageProps = {
  pagename: string;
};
const AsyncPage = loadable<AsyncPageProps>(
  props => import(`pages/${props.pagename}`)
);

export default AsyncPage;
