import InfiniteScroll from "react-infinite-scroller";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Person } from "./Person";

const initialUrl = "https://swapi.dev/api/people/";

const fetchUrl = async (url) => {
  const response = await fetch(url);
  return response.json();
};

export function InfinitePeople() {
  //fetchNextPage - fn to run when need to fetch more data
  //hasNextPage - whether there is more pages
  //data - has a next property (https://swapi.dev/api/people)
  //getNextPageParam - sets the pageParam for next page which is used by queryFn of next page
  //hasNextPage - depens on if lastPage.next returns undefined
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["sw-people"],
    queryFn: ({ pageParam = initialUrl }) => fetchUrl(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.next || undefined; //data returned from swapi has a next property (https://swapi.dev/api/people) - undefined if data is "null"
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
          return pageData.results.map((person, index) => {
            return (
              <Person
                key={index}
                name={person.name}
                hairColor={person.hair_color}
                eyeColor={person.eye_color}
              />
            );
          });
        })}
      </InfiniteScroll>
    </>
  );
}
