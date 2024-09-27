import InfiniteScroll from "react-infinite-scroller";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Species } from "./Species";

const initialUrl = "https://swapi.dev/api/species/";
const fetchUrl = async (url) => {
  const response = await fetch(url);
  return response.json();
};

export function InfiniteSpecies() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["sw-species"], //sw for 'star wars'
    queryFn: ({ pageParam = initialUrl }) => fetchUrl(pageParam),
    getNextPageParam: (lastPage) => {
      return lastPage.next || undefined;
    },
  });

  if (isLoading) {
    return <div className="loading">loading...</div>;
  }

  if (isError) {
    return <div className="error">error: {error.toString()}</div>;
  }

  return (
    <>
      {isFetching && <div className="loading">loading...</div>}

      <InfiniteScroll
        initialLoad={false}
        loadMore={() => {
          if (!isFetching) {
            fetchNextPage();
          }
        }}
        hasMore={hasNextPage}
      >
        {data.pages.map((pageData) => {
          return pageData.results.map((specie, index) => {
            return (
              <Species
                key={index}
                name={specie.name}
                averageLifespan={specie.averageLifespan}
                language={specie.averageLifespan}
              />
            );
          });
        })}
      </InfiniteScroll>
    </>
  );
}
