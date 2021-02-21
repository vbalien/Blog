import { addDecorator } from "@storybook/react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  layout: "fullscreen",
};

addDecorator(StoryFn => (
  <BrowserRouter>
    <ChakraProvider>
      <StoryFn />
    </ChakraProvider>
  </BrowserRouter>
));
