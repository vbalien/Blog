import React from "react";
import { Route, Switch } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import AsyncLayout from "./AsyncLayout";
import PageComponent from "./PageComponent";

export type AppProps = { layout: string };
const App: React.FC<AppProps> = ({ layout }) => {
  return (
    <ChakraProvider resetCSS>
      <Switch>
        <Route exact path={[":page(^)", "/:page(.*)"]}>
          <AsyncLayout layout={layout}>
            <PageComponent />
          </AsyncLayout>
        </Route>
      </Switch>
    </ChakraProvider>
  );
};
export default App;
