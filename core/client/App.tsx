import React from "react";
import { Route, Switch } from "react-router-dom";
import AsyncLayout from "./AsyncLayout";

const App: React.FC = () => {
  return (
    <Switch>
      <Route exact path={[":page(^)", "/:page(.*)"]}>
        <AsyncLayout layout={"default"}>{"Hello World"}</AsyncLayout>
      </Route>
    </Switch>
  );
};
export default App;
