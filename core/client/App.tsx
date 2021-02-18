import React from "react";
import { Route, Switch } from "react-router-dom";
import AsyncLayout from "./AsyncLayout";
import PageComponent from "./PageComponent";

export type AppProps = { layout: string };
const App: React.FC<AppProps> = ({ layout }) => {
  return (
    <Switch>
      <Route exact path={[":page(^)", "/:page(.*)"]}>
        <AsyncLayout layout={layout}>
          <PageComponent />
        </AsyncLayout>
      </Route>
    </Switch>
  );
};
export default App;
