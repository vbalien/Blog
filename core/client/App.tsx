import React from "react";
import { Route, Switch } from "react-router-dom";
import AsyncLayout from "./AsyncLayout";
import PageComponent from "./PageComponent";

const App: React.FC = () => {
  return (
    <Switch>
      <Route exact path={[":page(^)", "/:page(.*)"]}>
        <AsyncLayout layout={"default"}>
          <PageComponent />
        </AsyncLayout>
      </Route>
    </Switch>
  );
};
export default App;
