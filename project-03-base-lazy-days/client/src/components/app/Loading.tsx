import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Spinner, Text } from "@chakra-ui/react";

export function Loading() {
  const isFetching = useIsFetching(); //returns a number representing query calls in fetching state, if none, then spinner wont show
  const isMutating = useIsMutating();

  const display = isFetching || isMutating ? "inherit" : "none";

  return (
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="olive.200"
      color="olive.800"
      role="status"
      position="fixed"
      zIndex="9999"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      display={display}
    >
      <Text display="none">Loading...</Text>
    </Spinner>
  );
}
