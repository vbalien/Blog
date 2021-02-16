import loadable from "@loadable/component";

type AsyncLayoutProps = {
  layout: string;
};
const AsyncLayout = loadable<AsyncLayoutProps>(
  props => import(`layouts/${props.layout}`)
);

export default AsyncLayout;
