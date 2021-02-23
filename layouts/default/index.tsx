import React from "react";
import { Sidebar } from "./Sidebar";
import { Box } from "@chakra-ui/react";
import { MDXProvider } from "@mdx-js/react";
import CodeBlock from "./CodeBlock";
import "./markdown.css";

const components = {
  pre(props) {
    return <div {...props} />;
  },
  code(props) {
    return <CodeBlock {...props} />;
  },
  blockquote(props) {
    return (
      <Box
        width="full"
        alignItems="center"
        position="relative"
        overflow="hidden"
        paddingLeft="0.75rem"
        paddingRight="1rem"
        paddingTop="0.75rem"
        paddingBottom="0.75rem"
        borderLeft="4px solid"
        borderColor="#DD6B20"
        background="#FEEBC8"
        marginTop="1.5rem"
        borderRadius="4px"
        marginBottom="1.5rem"
        {...props}
      />
    );
  },
};

const DefaultLayout: Layout = ({ children }) => {
  return (
    <MDXProvider components={components}>
      <Box display="flex" height="100vh">
        <Sidebar name="金持寿" description="フロントエンドディベロッパー" />
        <Box
          className="markdown-body"
          width="calc(50% + 350px)"
          p="30px"
          overflowY="scroll"
        >
          <Box as="article" maxW="1024px">
            {children}
          </Box>
        </Box>
      </Box>
    </MDXProvider>
  );
};

DefaultLayout.PreloadStates = [];

export default DefaultLayout;
