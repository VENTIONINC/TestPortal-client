import { ChakraProvider as Provider, defaultSystem } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

export const ChakraProvider = ({ children }: PropsWithChildren) => {
  return <Provider value={defaultSystem}>{children}</Provider>;
};
