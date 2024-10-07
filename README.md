# React-Query / @Tanstack/react-query

https://www.udemy.com/course/learn-react-query/

https://github.com/clarklindev/react-query-tanstack-react-query-react-server-side-state-management.git

- Tanstack query v5 (supports multiple frameworks, programing languages) - this udemy course
- TanStack Query v4

## section 01: creating queries and loading / error states

- what is it? server-side state management
- so react-query and tanstack react-query are the same thing.
- on client-side you associate a "queryFn" that fetches data from server with a "queryKey"

### maintain cache

- react query maintains a cache of server data on client,

  - fetch data with react query
  - it first checks the cache
  - react-query's job is to maintain the data in the cache
  - you decide when the cache should be updated with new data from server

### loading/error states

- react query maintains loading/error states automatically

### Pagination / infinite scroll

- tools to fetch data in pieces

### prefetching

- anticipate needed data by prefetching and putting it in cache

### manage updates of data on server

- manage updates (mutations) of data on server

### de-duplicating of requests

- queries are identified by a key - react query can manage requests
- if you load a page and several components request the same data, react query can send query only once

### retry on error

### callbacks

- query result callbacks

---

## First project

- using [json.typicode](https://jsonplaceholder.typicode.com/) for server-side data
- simulate a blog server
- base-blog-em

### learning concepts

1. fetching data
2. loading/error state
3. react-query dev-tools
4. pagination
5. prefetching
6. mutations

### installing react-query

- install react-query

```
pnpm i @tanstack/react-query
```

### 4. adding query client and provider

- create query client (manage queries and cache) - provides cache and client config to children
- Apply to query provider - takes query client as a value to provider
- queryClient becomes available to any descendants

```js
//app.js
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return <QueryClientProvider client={queryClient}>// ...</QueryClientProvider>;
}
```

### 5. creating queries with useQuery

- call useQuery hook
- hook that queries the server
- `queryKey` - the query key defines the data in the query cache
- `queryFn` - function to run to fetch the data

```js
//src/api.js
export async function fetchPosts(pageNum) {
  const response = await fetch("");
  throw new Error("new error"); //'error' message is also usable with react-query
}
```

```js
//src/Posts.jsx
import { fetchPosts, deletePost, updatePost } from "./api"; //query function
import { useQuery, isLoading, isError, error } from "@tanstack/react-query";

//...
const { data } = useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
}); //data is the return value of the query function

if (!data) {
  return <div />;
}

if (isLoading) {
}

if (isError) {
  return <h3>the error is: {error.toString()}</h3>;
}
```

### 6. handling load and error states

- https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
- getting (isloading, isError, error) state off the useQuery() call,

### isLoading vs isFetching

- isFetching -> async query hasnt resolved (more "general/broad scope" than "isLoading")
- isLoading -> subset of isFetching (there is no cached data, AND isFetching) -> this is important for pagination (where we want to know if we have cached data)

### react-query dev-tools

```
pnpm i @tanstack/react-query-devtools
```

- dev tools arent included in production (process.env.NODE_ENV === 'development')
- ReactQueryDevTools -> MUST BE between the `<QueryClientProvider>`
- show queries by query key
  - status of queries
  - last updated timestamp
- date explorer
- query explorer

```js
//app.js
import { ReactQueryDevTools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      // ...
      <ReactQueryDevTools />
    </QueryClientProvider>
  );
}
```

### query status

- fresh
- fetching
- paused
- stale
- inactive

### 8. stale time vs garbage collection time

- stale time lets you know when data needs to be refetched
- data goes from `fresh` to `stale` state
- stale -> stale data is expired (ready for refetch) -> it is still in cache
- data needs to be revalidated (same as SWR (vercel) show stale data, but fetch new data from server)
- `staleTime` (max age before refetch (in milliseconds))
- stale time is default 0 -> meaning data is always out of date and always needs to be refetched

```js
import { fetchPosts, deletePost, updatePost } from "./api"; //query function
import { useQuery, isLoading, isError, error } from "@tanstack/react-query";

//...
const { data } = useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
  staleTime: 2000,
}); //data is the return value of the query function
```

### gc time (garbage collection)

- how long to keep data around (data that may be reused later)
- data goes into "cold storage" if its in the cache but not being used.
- cache data expires after (gc time (garbage collection time))
- default is 5min (time that has elapsed since last useQuery)
- gc time is not ticking while data is showing on page.
- gc time starts when data is no longer being used by a component
- after gc time elapses, data is no longer available to useQuery()

## Summary

- fresh AND in cache -> display cached data (no refetch)
- stale AND in cache -> display cached data (refetch)
- Not in cache -> nothing to display during fetch

---

## SECTION 2 - Pagination, pre-fetching, mutations

### 10. fetching - Code quiz! create query for blog comments

- src/PostDetail.jsx
- using useQuery()
- post has an 'id' property which you can use to fetch specific post from json placeholder
- note queryKey has "dependency missing in queryKey"

```js
//src/PostDetail.jsx
import { fetchComments } from "./api";
import { useQuery } from "@tanstack/react-query";

import "./PostDetail.css";

export function PostDetail({ post }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["comments"],
    queryFn: () => fetchComments(post.id),
  });

  if (isLoading) {
    return <h3>Loading...</h3>;
  }

  if (isError) {
    return (
      <>
        <h3>oops, error</h3>
        <p>{error.toString()}</p>
      </>
    );
  }

  return (
    <>
      <h3 style={{ color: "blue" }}>{post.title}</h3>
      <button>Delete</button> <button>Update title</button>
      <p>{post.body}</p>
      <h4>Comments</h4>
      {data.map((comment) => (
        <li key={comment.id}>
          {comment.email}: {comment.body}
        </li>
      ))}
    </>
  );
}
```

### 11. query keys

- query keys are how react decides to get new data from server
- the comments arent refreshing because every query is using the same query key `["comments"]`
- ...AND data for known keys only refetch when theres a trigger event
- eg. trigger events - component remount, window refocus, running refetch function, automated refetch, query invalidation after a mutation
- FIX: cache on a per query basis (using post id) ie. `queryKey: ["comments", post.id]`,
- FIX: giving queryKey a second element in the array, when key changes, it creates a new query.

### 12. pagination

- prev and next buttons for comments
- track current page with component state (currentPage)
- with "infinite scroll" (react query maintains which page we are on)
- we update currentPage state when user clicks on prev and next button -> react query detects query key has changed and with re-fetch
- NOTE: the problem is that the data is uncached and you have to wait for data to load between clicking prev and next
- NOTE: we can improve the below by pre-caching (pre-fetch)

```js
//src/Posts.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchPosts, deletePost, updatePost } from "./api";
import { PostDetail } from "./PostDetail";

const maxPostPage = 10;

export function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);

  // replace with useQuery
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["posts", currentPage],
    queryFn: () => fetchPosts(currentPage),
    staleTime: 2000,
  }); //data is the return value of the query function

  if (isLoading) {
    return <h3>loading...</h3>; //use devtools -> network throttling to slowdown load
  }

  if (isError) {
    return <h3>the error is: {error.toString()}</h3>;
  }
  return (
    <>
      <ul>
        {data.map((post) => (
          <li
            key={post.id}
            className="post-title"
            onClick={() => setSelectedPost(post)}
          >
            {post.title}
          </li>
        ))}
      </ul>
      <div className="pages">
        <button
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((previousValue) => previousValue - 1)}
        >
          Previous page
        </button>
        <span>Page {currentPage}</span>
        <button
          disabled={currentPage >= maxPostPage}
          onClick={() => setCurrentPage((previousValue) => previousValue + 1)}
        >
          Next page
        </button>
      </div>
      <hr />
      {selectedPost && <PostDetail post={selectedPost} />}
    </>
  );
}
```

### 13. prefetch

- [DOCUMENTATION](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching)
- adds data to cache
- automatically stale (configurable)
- shows cache data (as long as it has not expired) while re-fetching
- prefetch can be used for not only pagination but also to anticipate data needs

- prefetch is a method of queryClient(): `import {QueryClient} from '@tanstack/react-query'`
- to use the hook, useQueryClient(): `import {useQueryClient} from '@tanstack/react-query'`
- NOTE: we use useEffect to determine state updates on 'currentPage' and prefetch (whatever the nextpage will be) with queryClient.prefetchQuery()
- NOTE: the query key for prefetchQuery() needs to have the same shape as useQuery().

```js
//src/Posts.jsx
import { useEffect } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

//...
export function Posts() {
  const { currentPage, setCurrentPage } = useState(1);
  const queryClient = useQueryClient();

  useEffect(() => {
    const nextPage = currentPage + 1;

    queryClient.prefetchQuery({
      queryKey: ["posts", nextPage],
      queryFn: () => fetchPosts(nextPage),
    });
  }, [currentPage, queryClient]);

  if (isFetching) {
    //this will show everytime regardless if there is cached data
  }

  if (isLoading) {
  }
}
```

### 14. isLoading vs isFetching (REVISITED)

- isFetching -> async query function hasnt resolved (ie still fetching the data) - it doesnt look at if there is cached data

- isLoading -> subset of isFetching (there is no cached data, AND isFetching is true) -> this is important for pagination (where we want to know if we have cached data)
- isLoading -> is when (`isFetching` is TRUE) AND there is (no cached data)

- prefetchQuery and useQuery have different default staleTime
  - prefetchQuery default staletime is 0

### 15. mutations

- [DOCUMENTATION](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
- making a call to server to update data on server
- so you show user the updated data (optimistic update), assuming all is successful, and then the server does the update and when server update completes you either get an error (you roll-back) or the optimistic update stays in place (since it happened before the server updated its data)
- HOOK -> useMutation() hook returns a mutate() function
- doesnt need query key
- there is an 'isLoading' but no 'isFetching'
- by default no retries

### 16. delete posts with useMutation()

- use delete button to delete post and give user indication of whats happening
- delete requires postId
- `useMutation()` returns `deleteMutation` (which has a mutate() function)
- and deleteMutation.mutate() will run in PostDetail.jsx component, so the whole deleteMutation will be passed to PostDetail component
- you need to reset the mutation when clicking on another post

```js
//src/Posts.jsx

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {deletePost} from './api';

export function Posts(){
  //...

  const deleteMutation = useMutation({
    mutationFn: (postId)=> deletePost(postId)
  });

  //...
  return (
    <>
      <ul>
      {data.map(post=> (
        <li onClick={
          deleteMutation.reset();
          setSelectedPost(post)
        }>
        {post.title}
        </li>
      ))}
      </ul>
      {selectedPost && <PostDetail post={selectedPost} deleteMutation={deleteMutation}/>}
    </>
  )

}
```

### 17. other useMutation properties like .reset()

- NOTE: the mutate() function receives post.id and this is used by Posts.jsx useMutation's mutationFn,
- useMutation has a `isPending` return status
- reseting the mutation means when clicking on another post, the mutation status resets
- `deleteMutation.reset()` resets all status properties

```js
//src/PostDetail.jsx
export function PostDetail({post, deleteMutation}){

  //...
  return (
    <>
      <div><button onClick={()=>deleteMutation.mutate(post.id)}>
      {
        deleteMutation.isPending &&
        (<p className="loading">deleting the post</p>)

        deleteMutation.isError &&
        (<p className="error">error deleting the post: {deleteMutation.error.toString()}</p>)

        deleteMutation.isSuccess &&
        (<p className="success">post was deleted</p>)
      }
      </div>

      <div><button>update title</button></div>
    </>
  )
}

```

### 18. updating the title using useMutation()

- see above / code similar to delete using useMutation

---

## SECTION 3 - Infinite queries for loading data JIT (just-in-time)

### Section summary

- react query manages
  - pageParams -> for next page to be fetched
  - getNextPageParams - getNextPageParam: (lastPage, allPages)
  - hasNextPage -> boolean to indicate whether pageParam is undefined
- component handles calling `fetchNextPage`
  - use hasNextPage value to determine when to stop

---

- fetch more data (Just-in-time) when a user scrolls
- its an optimization instead of fetching all data at once
- starwars api (returns data with "next" property and "previous" property)

### fetch new data

- when user clicks a button
- when user scrolls to a point on page (bottom of data)
- looking at devtools, there is only one query, and data just gets added to it.

### hook

- `useInfiniteQuery()` tracks what the next query will be (returned as part of returned data)
- return object with
  - "previous"
  - "next"
  - "results" (array of data)
  - "count" total items

### Swapi (star wars api)

- https://swapi.dev/
- https://swapi.dev/documentation
- https://swapi-node.vercel.app alternative api pull-request: https://github.com/bonnie/udemy-REACT-QUERY/pull/23/files

TODO:

- add queryClient
- and add provider to App.js
- install react query (@tanstack/react-query)
- install devtools (pnpm i @tanstack/react-query-devtools)

### useInfiniteQuery()

- shape of data returned is different from useQuery()
- returned data is an object with 2 properties:
  - "pages" (an array of objects for each page of data)
  - "pageParams" what the param is for every page (managed by react query)
- every query has its own element in the "pages" array, and that element represents the pages data for that query
- pageParams keeps track of the keys of queries that have been retrieved
- KEYWORDS: `fetchNextPage`, `hasNextPage`, `getNextPageParam`, `data`

### react-infinite-scroller

- pacakge: "react-infinite-scroller" works well with useInfiniteQuery
- request 2 props:

1. hasMore (which uses `hasNextPage` from useInfiniteQuery)

```js
hasMore = { hasNextPage };
```

2. loadMore ( which uses `fetchNextPage` from useInfiniteQuery)

```js
loadMore={()=>{
  if(!isFetching) {
    fetchNextPage()
  }
}}
```

- component takes care of detecting when to load more
- access data via 'pages' -> 'results' -> `data.pages[x].results`
- ERRORS: if you try use data before the query function returns -> FIX: handle errors and loading (same as useQuery)

- NOTE: inifite-scroll loads twice if this is not set `initialLoad={false}`

### The explanation

- The issue here is with how the InfiniteScroll component works. The InfiniteScroll component automatically loads the first page of data -- and this first page of data is determined by the first return value of the loadMore function. If we weren't using React Query, this would be great -- InfiniteScroll would take care of the first page of data and all subsequent pages. However, we're using the InfiniteScroll component a little differently. Instead of using loadMore for the first page of data, we're loading the first page of data via useQuery. The loadMore function is only for subsequent pages, so the first function value of loadMore is for page 2.

- The result is, we're loading the first page of data (page 1) via useQuery, and at the same time, InfiniteScroll is loading what it thinks is the first page of data (the first return value of the loadMore function, which is page 2). Then when we pre-fetch page 2, we're loading page 2 for a second time.

### The solution

- We can eliminate the initial page load by InfiniteScroll by setting the initialLoad prop to false:
- This will prevent loadMore from running on page load, so page 2 won't be fetched as the "initial value" of the page. The only call to page 2 will be when loadMore is triggered at the end of the first page.

```js
  <InfiniteScroll
    initialLoad={false}
    // other props...
  >
```

```js
//src/people/infinitePeople.jsx
import InfiniteScroll from "react-infinite-scroller";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

import { Person } from "./Person";

const initialUrl = "https://swapi.dev/api/people/";

const fetchUrl = async (url) => {
  const response = await fetch(url);
  return response.json();
};

export function InfinitePeople() {
  //fetchNextPage - fn to run when need to fetch more data
  //hasNextPage - whether there is more pages (depends on if lastPage.next returns undefined)
  //data - has a next property (https://swapi.dev/api/people)
  //getNextPageParam - sets the pageParam for next page which is used by queryFn of next page
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

  //fix for undefined .data error
  //28. loading and error handling useInfiniteQuery (fetching and error)- FIX: using data before there is data (by adding if() checks)
  //but now everytime it is loading, the already populated data dissapears..so the solution is to always return the loaded data (see below) but also add a check for if "isFetching" then show `<div className="loading">loading...</div>`
  if (isLoading) {
    return <div className="loading">loading...</div>;
  }

  if (isError) {
    return <div className="error">error: {error.toString()}</div>;
  }

  return (
    <>
      {isFetching && <div className="loading">loading...</div> /*this is the fix for showing status of loading*/}

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
    <>
  );
}
```

### 30. bidirectional scrolling

- 'next' has equivalent 'previous' for all infinite scroll

---

## SECTION 04 - React Query in Larger Apps: setup, centralization, custom hook

- dealing with setup, centralization (error/loading)
- custom hooks -> centralizing useReactQuery via hooks instead of using it directly in code
- project - Lazy Day Spa (creating appointments for a SPA)
- project - live backend, not responsive/mobile friendly, not auth protected
- REQUIRED: create a file: `.env` with `EXPRESS_SECRET` (put any random string) for use by encryption package

TODO:

- centralizing fetching indicator / error handling
- refetching data
- react query integrating with auth
- dependent queries
- testing

### client

- install @tanstack/react-query
- the alias'es are set up in tsconfig.json

```json
//tsconfig.json

  //...
  "paths": {
    "@/*": ["src/*"],
    "@shared/*": ["../shared/*"]
  },
  //...

```

- react-query client in its own file (src/react-query/queryClient.ts) instead of in App.jsx
- export the queryClient

```ts
// src/react-query/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();
```

- hook up QueryClientProvider with queryClient
- add ReactQueryDevtools component

```ts
//App.ts
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/react-query/queryClient";

import { Home } from "./Home";
import { Loading } from "./Loading";
import { Navbar } from "./Navbar";
import { ToastContainer } from "./toast";

import { AuthContextProvider } from "@/auth/AuthContext";
import { Calendar } from "@/components/appointments/Calendar";
import { AllStaff } from "@/components/staff/AllStaff";
import { Treatments } from "@/components/treatments/Treatments";
import { Signin } from "@/components/user/Signin";
import { UserProfile } from "@/components/user/UserProfile";
import { theme } from "@/theme";

export function App() {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <Loading />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Staff" element={<AllStaff />} />
              <Route path="/Calendar" element={<Calendar />} />
              <Route path="/Treatments" element={<Treatments />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/user/:id" element={<UserProfile />} />
            </Routes>
          </BrowserRouter>
          <ToastContainer />
          <ReactQueryDevtools />
        </AuthContextProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}
```

### 38. Custom hooks

- in large apps, you make a custom hook for each type of data
  - then you can access from multiple components
  - no keys mixup
  - query functions encapsulated in custom hook
  - abstracts implementation from display layer
    - update hook if you change implementation
    - no need to update components
- ARTICLE - https://romanslonov.com/blog/tanstack-query-reusable-custom-hooks

- note for axios, the base url is set in `src/react-query/constants.js` 'baseUrl'

```ts
// src/components/app/treatments/hooks/useTreatments.ts
```

### 40. centralized fetching indicator (useIsFetching)

- instead of using 'isFetching' directly from useQuery return object,
- use `useIsFetching()` hook
- we have a Loading component in App that will be used by all components
- then Loading.ts will use the `useIsFetching` hook to check whether to display spinner

```ts
//src/components/app/Loading.ts
import { useIsFetching } from "@tanstack/react-query";

export default Loading(){
  const isFetching = useIsFetching(); //returns a number representing query calls in fetching state, if none, then spinner wont show
}
//...
```

### 41. onError default for QueryClient

- there is no useError() hook, like the useIsFetching() hook for centrally displaying errors
- instead, set default 'onError' callback for QueryCache
  - defaults for QueryCache
  - https://tanstack.com/query/latest/docs/reference/QueryCache#querycache

```ts
//src/react-query/queryClient.ts
import { toast } from "@/components/app/toast";
import { QueryClient } from "@tanstack/react-query";
function errorHandler(errorMsg: string) {
  // https://chakra-ui.com/docs/components/toast#preventing-duplicate-toast
  // one message per page load, not one message per query
  // the user doesn't care that there were three failed queries on the staff page
  //    (staff, treatments, user)
  const id = "react-query-toast";

  if (!toast.isActive(id)) {
    const action = "fetch";
    const title = `could not ${action} data: ${
      errorMsg ?? "error connecting to server"
    }`;
    toast({ id, title, status: "error", variant: "subtle", isClosable: true });
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      //handle error
      errorHandler(error.message);
    },
  }),
});
```

### 41. code quiz (useStaff)

- write customHook for staff data `/src/components/staff/hooks/useStaff.ts`
- remove placeholder empty array
- use `queryKeys` constant for query key
- uncomment and use `getStaff` query function
- use fallback data
- AllStaff.tsx already uses `useStaff`
- hook should use global fetching indicator
- default error handling

---

- this section(s) deal with aditional features when using react query

## Section 5 AND Section 6

## Section 5

### prefetching

- you want to prefetch data when there isnt anything in the cache

#### options for pre-populating data

### 44. adding data to the cache

- prefetchQuery vs useQuery - prefetchQuery is a one-time thing, whereas useQuery will be reused and recall fetch
- to use prefetchQuery, access via queryClient

```ts
import { useQueryClient } from "@tanstack/react-query";
const queryClient = useQueryClient({ context });
```

- option -> where to use? | data from ? | added to cache ?
- `prefetchQuery` (used for adding data to cache) -> method of queryClient | server | yes
- `setQueryData` (used for adding data to cache) -> method of queryClient | client | yes
- `placeholderData` (temp place to store data and not add to cache) -> options to useQuery | client | no
- `initialData` -> options to useQuery | client | yes

### 45. prefetch in detail

- so the idea is to prefetch data and store it in cache
- but if this data is not "requested" before garbage collection time, then it will be garbage collected
- you can specify the gcTime.
- TODO: make a `usePrefetchTreatments` hook in `useTreatments.ts`, just as useQuery is called over and over,
  usePrefetchTreatments will be called from Home (landing page) so that it preloads data and adds data to cache
- when user visits Treatments page, if its within garbage collection time, it shows the cache AND fetches fresh data
- when user visits Treatments page, if its been garbage collected, there is no initial data, and useQuery fetches fresh data
- from Home.tsx just call `usePrefetchTreatments`

### 46. implementation

```ts
//src/components/treatments/hooks/useTreatments.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function usePrefetchTreatments(): void {
  const queryClient = useQueryClient();
  queryClient.prefetchQuery({
    queryKey: [queryKeys.treatments],
    queryFn: getTreatments,
  });
}
```

```ts
//src/components/app/Home.tsx
import { Icon, Stack, Text } from "@chakra-ui/react";
import { GiFlowerPot } from "react-icons/gi";

import { usePrefetchTreatments } from "@/components/treatments/hooks/useTreatments";
import { BackgroundImage } from "@/components/common/BackgroundImage";

export function Home() {
  usePrefetchTreatments(); //the reason this is not in a useEffect is because you cant run hooks inside useEffect callbacks

  return (
    <Stack textAlign="center" justify="center" height="84vh">
      <BackgroundImage />
      <Text textAlign="center" fontFamily="Forum, sans-serif" fontSize="6em">
        <Icon m={4} verticalAlign="top" as={GiFlowerPot} />
        Lazy Days Spa
      </Text>
      <Text>Hours: limited</Text>
      <Text>Address: nearby</Text>
    </Stack>
  );
}
```

### 47. use appointments hook

- src/components/appointments/hooks/useAppointments.tsx
- src/components/appointments/Appointments.tsx
- src/components/appointments/Calendar.tsx

### 51. summary

- pre-populate data options: pre-fetch, setQueryData, placeholderData, initialData
- pre-fetch to pre-populate cache
  - on component render
  - on page (month/year) update
- treat keys as dependency arrays

---

## Section 6

- useCallback and useMemo are both hooks in React that help optimize performance, but they serve different purposes:

### useCallback

Purpose: Memoizes a function.
Use Case: Prevents a function from being recreated on every render unless its dependencies change. This is useful when passing callbacks to child components, helping to avoid unnecessary re-renders.
Syntax:

```js
const memoizedCallback = useCallback(() => {
  // function logic
}, [dependencies]);
```

### useMemo

Purpose: Memoizes a computed value.
Use Case: Prevents expensive calculations from being re-executed on every render unless its dependencies change. This is useful for optimizing performance when dealing with derived state or computationally heavy operations.
Syntax:

```js
const memoizedValue = useMemo(() => {
  // computation logic
  return computedValue;
}, [dependencies]);
```

- https://tkdodo.eu/blog/react-query-data-transformations

```js
// CORRECT memoizes by queryInfo.data
React.useMemo(
  () => queryInfo.data?.map((todo) => todo.name.toUpperCase()),
  [queryInfo.data]
);
```

### Summary

- Use useCallback when you need to memoize a function.
- Use useMemo when you need to memoize a value resulting from a computation.

### transforming

### 52. Filtering data with the useQuery's select Option

- `select` option in `useQuery({select:()=>{}})` allows us to filter data (but it cant be an anonymous function)
  - react query memo-izes to reduce unecessary computations
  - only runs if data changes or the function has changed
  - to make a stable function from an anonymous function use `useCallback`
- filter function in utils: `getAvailableAppointments`
- by default the `select` function receives the data destructed from `const {data} = useQuery()`

### the hook

```ts
//src/components/appointments/hooks/useAppointments.ts
import { getAvailableAppointments } from "../utils";

export function useAppointments() {
  /*...*/

  const selectFunction = useCallback(
    (data: AppointmentDateMap, showAll: boolean) => {
      if (showAll) {
        return data;
      }
      return getAvailableAppointments(data, userId);
    },
    [userId]
  );

  const fallback: AppointmentDateMap = {};

  const { data: appointments = fallback } = useQuery({
    queryKey: [queryKeys.appointments, monthYear.year, monthYear.month],
    queryFn: () => getAppointments(monthYear.year, monthYear.month),
    select: (data) => selectFunction(data, showAll),
  });

  /*...*/
}
```

#### 53. useStaff

- src/components/staff/hooks/useStaff.ts
  - `const [filter, setFilter] = useState("all");` maintains the selection
- src/components/staff/AllStaff.tsx
- src/components/staff/utils.ts `filterByTreatment` will be used in select callback
- SOLUTION (lesson 53 - 3min52sec)

#### the filter function

- src/components/staff/utils.ts

```ts
//src/components/staff/utils.ts
import type { Staff } from "@shared/types";

export function filterByTreatment(
  staff: Staff[],
  treatmentName: string
): Staff[] {
  return staff.filter((person) =>
    person.treatmentNames
      .map((t) => t.toLowerCase())
      .includes(treatmentName.toLowerCase())
  );
}
```

```ts
//src/components/staff/AllStaff.tsx
export function AllStaff() {
  const treatments = useTreatments();
  const { staff, filter, setFilter } = useStaff();
  return (
    <RadioGroup onChange={setFilter} value={filter}>
      <Radio value="all">All</Radio>

      {treatments.map((t, index) => (
        <Radio key={t.id} value={t.name}>
          {t.name}
        </Radio>
      ))}
    </RadioGroup>
  );
}
```

```ts
//src/components/staff/hooks/useStaff.ts
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import type { Staff } from "@shared/types";

import { filterByTreatment } from "../utils";

import { axiosInstance } from "@/axiosInstance";
import { queryKeys } from "@/react-query/constants";

// query function for useQuery
async function getStaff(): Promise<Staff[]> {
  const { data } = await axiosInstance.get("/staff");
  return data;
}

export function useStaff() {
  // for filtering staff by treatment
  const [filter, setFilter] = useState("all");

  const filterFunction = useCallback(
    (unfilteredStaff: Staff[]) => {
      if (filter === "all") {
        return unfilteredStaff;
      }
      return filterByTreatment(unfilteredStaff, filter);
    },
    [filter]
  ); //when filter changes...this function will re-run

  // TODO: get data from server via useQuery
  const fallback: Staff[] = [];

  const { data: staff = fallback } = useQuery({
    queryKey: [queryKeys.staff],
    queryFn: getStaff,
    select: filterFunction, //THIS IS WHAT WE ADDED..
  });

  return { staff, filter, setFilter };
}
```

### 54. re-fetching data

- re-fetching ensures stale data gets updated from server
- you can see this when you leave the page and refocus

#### auto-refetch (default)

- by default, stale queries are automatically re-fetched in the background when:
  - new instances of the query mount
  - everytime a react component (that has a useQuery call) mounts
  - window refocus
  - network reconnect
  - configured `refetchInterval` has expired
    - auto polling

### 55. update re-fetch options

- control with global or query-specific options:
  - refetchOnMount (bool) -> default: true
  - refetchOnWindowFocus (bool) -> default: true
  - refetchOnReconnect (bool) -> default: true
  - refetchInterval (milliseconds)
- or imperatively: `refetch` function in useQuery return object
- suppress refetch by:
  - increase staletime
  - turn off `refetchOnMount`, `refetchOnWindowFocus`, `refetchOnReconnect`
- NOTE: these options do NOT apply to .prefetch automatically

### 56. global refetch options

- globally applying refetch options
- they can still be overridden by indivual query options

TODO:

- `user profile` and `user appointments` invalidated after mutations
- `appointments` (auto refetching on interval)
- global options in `src/react-query/queryClient.ts` add `defaultOptions`

```ts
//src/react-query/queryClient.ts
import { QueryClient, QueryCache } from "@tanstack/react-query";

//...
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 600000, //10minutes,
      gcTime: 900000, //15min - garbage collection time
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      //handle error
      errorHandler(error.message);
    },
  }),
});
```

- once you add the refetch options globally you can remove from other hooks
- eg. `src/components/treatments/hooks/useTreatments.ts` -> there should be no refetch options since we added it globally

### 57 override refetch defaults

- add refetch overrides to useQuery and prefetchQuery options

```ts
//src/components/appointments/hooks/useAppointments.ts
import { getAvailableAppointments } from "../utils";

//for prefetchQuery and useQuery (OVERRIDE DEFAULT)
const commonOptions = {
  staleTime: 0,
  gcTime: 30000,
};

export function useAppointments() {
  /*...*/

  useEffect(() => {
    const nextMonthYear = getNewMonthYear(monthYear, 1);
    queryClient.prefetchQuery({
      queryKey: [
        queryKeys.appointments,
        nextMonthYear.year,
        nextMonthYear.month,
      ],
      queryFn: () => getAppointments(nextMonthYear.year, nextMonthYear.month),
      ...commonOptions,
    });
  }, [queryClient, monthYear]);

  /*...*/

  const selectFunction = useCallback(
    (data: AppointmentDateMap, showAll: boolean) => {
      if (showAll) {
        return data;
      }
      return getAvailableAppointments(data, userId);
    },
    [userId]
  );

  const fallback: AppointmentDateMap = {};

  const { data: appointments = fallback } = useQuery({
    queryKey: [queryKeys.appointments, monthYear.year, monthYear.month],
    queryFn: () => getAppointments(monthYear.year, monthYear.month),
    select: (data) => selectFunction(data, showAll),
    refetchOnWindowFocus: true,
    ...commonOptions,
  });

  /*...*/
}
```

### 58. polling

- poll server and automatically refetch data on regular basis
- use `refetchInterval` option of useQuery

- NOTE: useAppointments vs userAppointments

#### useUserAppointments

- show all appointments for user logged in (for all time)

#### useAppointments

- show all appointments for all users (for selected month + year)

```ts
//src/components/appointments/hooks/useAppointments.ts
const { data: appointments = fallback } = useQuery({
  queryKey: [queryKeys.appointments, monthYear.year, monthYear.month],
  queryFn: () => getAppointments(monthYear.year, monthYear.month),
  select: (data) => selectFunction(data, showAll),
  refetchOnWindowFocus: true,
  refetchInterval: 60000, //minute..
  ...commonOptions,
});
```

---

## Section 7 - React Query and authentication

### 60. intro to react query and auth

- integrate react query with authentication

### this section

- dependent queries (queries activated under certain conditions)
- `setQueryData`
- `removeQueries`

### Authentication

- section using JWT (token authentication)
- compares entered data with database, if they match -> server sends back a token
- then on future requests from server (that require authentication), client adds JWT token to headers with the request as proof of identity

### security

- token encodes username + id (using the env secret), when its decoded on server, its compared for matches
- this app, the token stored in user object that server sends back from server
- token persisted in localStorage
- JWT setup

### 61. Auth hooks - hook for auth and user data

- AuthContext's `useLoginData` -> returns value {`userId`, `userToken`, `clearLoginData`, `setLoginData`}
- `useAuthActions` -> returns auth methods {`signin`, `signout`, `signup`}
- `useUser` -> returns server user data {`user`, `updateUserData`, `clearUserData`}

### relationships

- `useUser` uses -> AuthContext's`useLoginData` (`userId`, `userToken`)
- `useAuthActions` uses -> `useUser` (`clearUserData`, `updateUserData`) AND `useLoginData` (`clearLoginData`, `setLoginData`)

### why do we set login data twice? once in useAuthActions and once in cache?

- why not store just in queryCache -> because the query requires data (`userId`) from query cache to perform the query
- logged in user is not server state -> its client state

## 62. add useQuery call to useUser

- `src/auth/AuthContext.tsx` -> `useLoginData` returns context
- `src/components/user/hooks/useUser.ts`

- so `useUser` needs (`userId` and `userToken` (for jwt)) from `useLoginData` (which is in AuthContext)

## 'enabled' to conditionally run query (dependent queries (queries activated under certain conditions))

```tsx
// src/auth/AuthContext.tsx
type AuthContextValue = {
  userId: number | null;
  userToken: string | null;
  setLoginData: (loginData: LoginData) => void;
  clearLoginData: () => void;
};

export const AuthContextProvider = ({
  children,
}: React.PropsWithChildren<object>) => {
  //...

  return (
    <AuthContext.Provider
      value={{ userId, userToken, clearLoginData, setLoginData }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

- but note userId will be null if userId doesnt exist (user not logged in), then we dont want to run the function, and we can prevent function of `useQuery` from running using the `enabled` option -> `!!userId` (if userId is truthy -> `true`, else `false`)

- note: we create `generateUserKey()` function to generate unique queryKey

```ts
//src/react-query/key-factories.ts
import { queryKeys } from "./constants";

export const generateUserKey = (userId: number, userToken: string) => {
  return [queryKeys.user, userId, userToken];
};
```

```ts
//src/components/user/hooks/useUser.ts
// query function

async function getUser(userId: number, userToken: string) {
  const { data }: AxiosResponse<{ user: User }> = await axiosInstance.get(
    `/user/${userId}`,
    {
      headers: getJWTHeader(userToken),
    }
  );

  return data.user;
}

export function useUser() {
  //get details on the userId
  const { userId, userToken } = useLoginData();

  // TODO: call useQuery to update user data from
  //renamed data to `user`
  const { data: user } = useQuery({
    enabled: !!userId, //conversion of userId to boolean (if userId is truthy -> `true`, else `false`)
    queryKey: generateUserKey(userId, userToken),
    queryFn: () => getUser(userId, userToken),
    staleTime: Infinity, //data never marked as stale
  });
}
```

### 63. setQueryData and removeQueries

- TODO FIX: when signing out, you want to remove the queryCache of signed-in user
- TODO FIX: this information we fetch from server is actually passed from server when you sign in.

### NEW QueryClient methods

- useUser.ts has useQuery that maintains user data from server
- we have methods to maintain the cache when user logs in (setQueryData) and when user logs out (removeQueries)

- setQueryData(key, data) - after user signs in, you want to update query cache with updated data
- removeQueries(queryFilter) - when user signs out -> with removeQueries, it takes queryKey..think of this as a prefix for what we want to remove from cache

```ts
//src/components/user/hooks/useUser.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";

//...

const queryClient = useQueryClient();

//this is called from src/auth/useAuthActions.tsx after user logs in authServerCall(), after user logs in, you receive the user data from server, and here you call updateUser(data.user)
function updateUser(newUser: User): void {
  //update user in query cache
  queryClient.setQueryData(generateUserKey(newUser.id, newUser.token), newUser);
}

// meant to be called from src/auth/useAuthActions.tsx when user calls signout()
function clearUser() {
  // TODO: reset user to null in query cache
  queryClient.removeQueries({
    queryKey: [queryKeys.user],
  });

  //remove appointments data
  queryClient.removeQueries({
    queryKey: [queryKeys.appointments, queryKeys.user],
  });
}
//...
```

### 64. add useQuery to useUserAppointments

- src/components/user/hooks/useUserAppointments.ts

```ts
import type { Appointment } from "@shared/types";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance, getJWTHeader } from "../../../axiosInstance";

import { useLoginData } from "@/auth/AuthContext";
import { queryKeys } from "@/react-query/constants";
import { generateAppointmentKey } from "@/react-query/key-factories";

// for when we need a query function for useQuery
async function getUserAppointments(
  userId: number,
  userToken: string
): Promise<Appointment[] | null> {
  const { data } = await axiosInstance.get(`/user/${userId}/appointments`, {
    headers: getJWTHeader(userToken),
  });
  return data.appointments;
}

export function useUserAppointments(): Appointment[] {
  const { userId, userToken } = useLoginData();

  const fallback: Appointment[] = [];

  const { data: userAppointments = fallback } = useQuery({
    enabled: !!userId,
    queryKey: generateAppointmentKey(userId, userToken), //must call like this because result of function call is a value
    queryFn: () => getUserAppointments(userId, userToken), //must call like this because its a function
  });
  return userAppointments;
}
```

## Section 8 - Mutations & query invalidations

- updating data on the server
- refreshing from server is important for mutations

TO LEARN:

- invalidate query on mutation so data is purged from the cache
- update cache with data returned from the server after mutation
- optimistic updates (assume mutation will be successful, rollback if not)

TODO:

- setup `global indicator` and `error handling` for mutations (same as for queries)
- Errors:
  - `onError` callback in `mutationCache` property of query client

```ts
//client/src/react-query/queryClient.ts
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

function createTitle(errorMsg: string, actionType: "query" | "mutation") {
  const action = actionType === "query" ? "fetch" : "update";
  return `could not ${action} data: ${
    errorMsg ?? "error connecting to server"
  }`;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 600000, //10minutes,
      gcTime: 900000, //15min - garbage collection time
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      //handle error
      const title = createTitle(error.message, "query");
      errorHandler(title);
    },
  }),

  mutationCache: new MutationCache({
    onError: (error) => {
      const title = createTitle(error.message, "mutation");
      errorHandler(title);
    },
  }),
});
```

TODO:

- Loading indicator:
  - `useIsMutating` is analogous (similar) to `useIsFetching` -> tells us if any mutation calls are unresolved
  - TODO: update `<Loading>` component to show `isMutating` / `isFetching`

```ts
//src/components/app/Loading.tsx
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export function Loading() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const display = isFetching || isMutating ? "inherit" : "none";

  return <Spinner display={display}>/*...*/</Spinner>;
}
```

### 67. custom Mutation hook: useReserveAppointments that uses useMutation

- `src/components/appointments/hooks/useReserveAppointment.ts`
- the hook returns a mutation function -> allows calendar to run mutation with the appointment
- similar to useQuery
- BUT there is no cache data
- no retries by default
- no refetch
- no isLoading vs isFetching (only isFetching)
- useMutation returns a mutate function in the return object which runs the mutations
- arguments added to mutate function -> useMutation will pass these arguments to the `{mutate}` function
- `useMutation()` has an `onSuccess` for the mutationFn (similar to onError callbacks)
- it will receive the data passed from mutationFn

### FLOW:

- when you run `useReserveAppointment()`, you will get back a function (the mutate),
- then you pass to the mutate function an `appointment of type Appointment`
- which internally calls setAppointmentUser(appointment, userId)

```ts
//src/components/appointments/hooks/useReserveAppointment.ts

import { useMutation } from "@tanstack/react-query";
import { Appointment } from "@shared/types";

//...

async function setAppointmentUser(
  appointment: Appointment,
  userId: number | undefined
): Promise<void> {
  if (!userId) return;
  const patchOp = appointment.userId ? "replace" : "add";
  const patchData = [{ op: patchOp, path: "/userId", value: userId }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

export function useReserveAppointment() {
  const { userId } = useLoginData();

  const toast = useCustomToast();

  const { mutate } = useMutation({
    mutationFn: (appointment: Appointment) =>
      setAppointmentUser(appointment, userId),
    onSuccess: () => {
      toast({ title: "you have reserved an appointment", status: "success" });
    },
  });

  return mutate;
}
```

- NOTE: here you can see the mutate function (reserveAppointment) returned by useReserveAppointment()

```ts
//src/components/appointments/Appointment.tsx
import { useReserveAppointment } from "./hooks/useReserveAppointment";

export function Appointment({ appointmentData }: AppointmentProps) {
  const reserveAppointment = useReserveAppointment();

  //...
  if (clickable) {
    //BELOW IS SUMMARY PSUEDOCODE -> SEE .TS CODE FOR IMPLEMENTATION
    //-checks if userId exists, and assigns the ternarary evaluation to onAppointmentClick
    onAppointmentClick = userId
      ? () => reserveAppointment(appointmentData)
      : undefined;
  }
}
```

- This updates the data but doesnt show the update visual (unless refreshed)

### 68. invalidating query after mutation

- after an update by mutation (the page did not automatically update)
- FIX: invalidateQueries

#### HOW...and what does invalidateQueries do?

- you invalidate the cache for appointments data when you mutate the appointment \*(by reserving the appointment)
- it marks the query as stale
- triggers refetch if query is active (ie. component that uses the query is currently rendered)

- FLOW:
  1. you call mutate
  2. within onSuccess, you call `invalidateQueries`
  3. this triggers a refetch of the data

### query filters

- useQueryClient() query client methods (removeQueries, invalidateQueries, cancelQueries, refetchQueries)

- all these methods can take a `query filter` argument.
- specifies queries by a filter (can filter by):
  - query key (including partial match)
  - type (active, inactive, all)
  - stale status (isFetching)
- we will use `query key` to invalidate appointment and user appointments when there is an appointment mutation on the server
- eg. any query beginning with the match (queryKeys.appointments) will be invalidated.

```ts
//...
queryClient.invalidateQueries({
  queryKey: [queryKeys.appointments],
});
```

```ts
import { Appointment } from "@shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useLoginData } from "@/auth/AuthContext";
import { axiosInstance } from "@/axiosInstance";
import { useCustomToast } from "@/components/app/hooks/useCustomToast";
import { queryKeys } from "@/react-query/constants";

// for when we need functions for useMutation
async function setAppointmentUser(
  appointment: Appointment,
  userId: number | undefined
): Promise<void> {
  if (!userId) return;
  const patchOp = appointment.userId ? "replace" : "add";
  const patchData = [{ op: patchOp, path: "/userId", value: userId }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

export function useReserveAppointment() {
  const queryClient = useQueryClient();

  const { userId } = useLoginData();

  const toast = useCustomToast();

  const { mutate } = useMutation({
    mutationFn: (appointment: Appointment) =>
      setAppointmentUser(appointment, userId),
    onSuccess: () => {
      //invalidate
      queryClient.invalidateQueries({
        queryKey: [queryKeys.appointments],
      });

      toast({ title: "you have reserved an appointment", status: "success" });
    },
  });
  return mutate;
}
```

### 69. Code Quiz - useMutation to delete appointments

- `src/components/appointments/hooks/useCancelAppointments.ts`
- similar to useReserveAppointment() -> the onSuccess() handler should invalidate appointment queries, show a toast

```ts
//src/components/appointments/hooks/useCancelAppointments.ts
import { Appointment } from "@shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { axiosInstance } from "@/axiosInstance";
import { useCustomToast } from "@/components/app/hooks/useCustomToast";
import { queryKeys } from "@/react-query/constants";

// for when server call is needed
async function removeAppointmentUser(appointment: Appointment): Promise<void> {
  const patchData = [{ op: "remove", path: "/userId" }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  const toast = useCustomToast();
  const { mutate } = useMutation({
    mutationFn: removeAppointmentUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.appointments],
      });

      toast({ title: "you have cancelled the appointment", status: "success" });
    },
  });

  return mutate;
}
```

### 70. update user and query cache with mutation response

- TODO: when updating data (do a mutation) and use the response data returned (from server) to update `user` and `query cache`
- new custom hook: usePatchUser (update type "patch")
- to update the cache -> `src/components/user/hooks/useUser.ts` hook -> `updateUser()` -> updates query cache using `setQueryData`
- RECALL: the useUser hook has the function `updateUser()`

```ts
//src/components/user/hooks/useUser.ts
export function useUser() {
  // meant to be called from useAuth
  function updateUser(newUser: User): void {
    // TODO: update the user in the query cache
    queryClient.setQueryData(
      generateUserKey(newUser.id, newUser.token),
      newUser
    );
  }
}
```

- usePatchUser will update with the useUser hook
- the new data is whatever is passed to `mutate("the new data")` call
- `mutate` is renamed `patchUser`
- and onSuccess, we want to updateUser with the response from server..
- NOTE: onSuccess receives whatever is returned from mutate function (here patchUserOnServer())

```ts
// src/components/user/hooks/usePatchUser.ts
import { useMutation } from "@tanstack/react-query";

import { useUser } from "./useUser.ts";

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData.token),
    }
  );
  return data.user;
}

export function usePatchUser() {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();

  const { mutate: patchUser } = useMutation({
    mutateFn: (newData: User) => patchUserOnServer(newData, user),
    onSuccess: (userData: User | null) => {
      updateUser(userData);
      toast({ title: "updated user", status: "success" });
    },
  });
  return patchUser;
}
```

### 71. NOTE: issue with query key: token in dependency array

- NOTE: we deliberately delete the userToken dependency because if the time changes, the token changes and we need to use the same token

#### ways to keep client in sync after mutation:

- invalidate queries
- updating cache with data returned after mutation -> but it only works if query key is the same before and after the mutation
- optimistic updates

```ts
//client/src/react-query/key-factories.ts
export const generateUserKey = (userId: number, userToken: string) => {
  //deliberately delete userToken from dependency
  return [queryKeys.user, userId];
};
```

### 72. optimistic updates with react query

- [optimistic-updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

- normally, data on page doesnt update until the cache has been updated for the query
- optimistic update -> showing updates (before they update on server) meaning you assume the update will succeed so you show the updated info before the server has saved the data but if something goes wrong, you can rollbar
- you can also update the cache (more complicated than just updating the ui)

  - cancel any queries in progress
  - save previous data for possible rollback
  - need to handle rollback (call the functions to update the cache with rollback data)
  - useful if showing the data in multiple components (updating cache updates data in all the places)

### Optimistic updates via UI method

- get mutation data with `useMutationState` (data you're sending to server to update)
- use a mutations key `mutationKey` (identifies the mutations data)
- display this data on page while mutation is pending
- invalidate query after mutation is `settled`
- if mutation failed, rollback the data
- NOTE: instead of updating user onSuccess, use `onSettled` its onSuccess and onError combined (ie. it runs regardless of success or fail)
- `onSettled` -> invalidate the query here..(requires queryClient)
- you are no longer updating (in onSuccess()) by calling useUser's `updateUser()` with the returned data
- NB - onSettled() returns the promise (the mutation)
- `return` the promise to maintain 'inProgress' status until query invalidation is complete

### 73. the code

- update the code in the mutation file (`src/components/user/hooks/usePatchUser.ts`)
- `src/components/user/UserProfile.ts`

```ts
//src/components/user/hooks/usePatchUser.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/react-query/constants";

export const MUTATION_KEY = "patch_user";
export function usePatchUser() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const toast = useCustomToast();

  const { mutate: patchUser } = useMutation({
    mutationKey: [MUTATION_KEY],
    mutationFn: (newData: User) => patchUserOnServer(newData, user),
    onSuccess: () => {
      return toast({ title: "updated user", status: "success" });
    },
    onSettled: () => {
      //`return` the promise to maintain 'inProgress' status until query invalidation is complete
      return queryClient.invalidateQueries({
        queryKey: [queryKeys.user],
      });
    },
  });

  return patchUser;
}
```

- UserProfile uses useMutationState()
- which will take a filter (because it could watch several mutations)
- `filters:{mutationKey: [MUTATION_KEY], status: "pending"}` note filter MUTATION_KEY while status is 'pending'
- using 'select' is similar to select in useQuery -> we will take the mutation data and get mutation states variables `mutation.state.variables`
- this will give us an `array` of pending data for all mutations that match the filters `{ mutationKey: [MUTATION_KEY], status: "pending" }`
- because there will only be one user (UserProfile), first item in array
- RESULT -> immediate update even while mutation is in progress

```ts
//src/components/user/UserProfile.ts
import { useMutationState } from "@tanstack/react-query";
import { User } from "@shared/types";

//...
const pendingData = useMutationState({
  filters: { mutationKey: [MUTATION_KEY], status: "pending" },
  select: (mutation) => {
    return mutation.state.variables as User;
  },
});

const pendingUser = pendingData ? pendingData[0] : null;

//...

return (
  // ...

  <Heading>
    Information for {pendingUser ? pendingUser.name : user?.name}
  </Heading>

  // ...
);
```

## Section 9 - testing

### 75. intro to testing react query

- https://tkdodo.eu/blog/testing-react-query
- https://tanstack.com/query/latest/docs/framework/react/guides/testing

- testing with -> react testing library
- test how user interactions (not internals)

### 76. setting up app for testing (mock service worker)

- `mock service worker` mocks server calls (mimics) the server returning data from request
- mock service worker intercepts server calls (return response based on our own handlers)
- prevent network calls during tests
- pre-empt server response (by defining our own test)
- vitest, mock-service-work, react-testing-library
- note: `src/mocks/handlers.js` and `src/setupTests.js`-> our functions determine what will be returned (mock data)

```
pnpm i vitest

pnpm i @testing-library/react

pnpm i @testing-library/jest-dom

pnpm i eslint-plugin-vitest eslint-plugin-testing-library

//mock-service-worker
pnpm i msw

```

- add test settings in `vite.config.js`
- `setupTest.js` runs before every test file runs
  -> global imports
  -> setup jest-dom for vitest
- `tsconfig.json` has compiler options for:

### typeRoots

- [`typeRoots`](https://www.typescriptlang.org/tsconfig/#typeRoots) - if typeRoots specified, only packages under typeRoots will be included

```json
{
  "compilerOptions": {
    "typeRoots": ["./typings", "./vendor/types"]
  }
}
```

- This config file will include all packages under ./typings and ./vendor/types, and no packages from ./node_modules/@types. All paths are relative to the tsconfig.json.

### types

- [`types`](https://www.typescriptlang.org/tsconfig/#types) - if types is specified, only packages listed will be included in the global scope. specifying only the exact types you want included, whereas typeRoots supports saying you want particular folders.

```json
{
  "compilerOptions": {
    "types": ["node", "jest", "express"]
  }
}
```

- This tsconfig.json file will only include ./node_modules/@types/node, ./node_modules/@types/jest and ./node_modules/@types/express. Other packages under node_modules/@types/\* will not be included.

### eslint

- .eslintrc.cjs
- import `eslint-plugin-vitest`
- add vitest globals to `globals` array
- add items to `extends` array
- turn off vitest `expect/expect` rule

### 77. query client and query provider in tests

- src/components/treatments/tests/Treatments.test.tsx

```terminal
pnpm test
```
- start tests by rendering the component

#### Error 01
- ERROR: if you use pnpm instead of project start file which uses npm, you wont be using the same package versions as pnpm ignores package.lock thats created with npm (regarding react-focus-lock) -> FIX `pnpm i react-focus-lock@2.11.3`
- FIX: use npm

#### Error 02
- ERROR: `Error: No QueryClient set, use QueryClientProvider to set one`
- the problem -> when we run Treatments component, it runs `useTreatments.ts` -> which uses `useQuery`

#### project setup
- but the problem is we are running test in isolation (its not in the App component where we have query client and provider setup)
- and you cant use any `useQuery` hooks without a `queryClient` provider
- FIX: create a function to wrap whatever we want to render in a query provider before rendering.
  - NOTE: and the query provider will need a queryClient
- TODO: each test gets a new `queryClient` -> put the creation in a function so we can pass defaults props.
- TODO: allow setting different clients 

#### creating a custom renderer
- we create a custom render and re-export the render with same name
- so now, instead of using react's render, we will have a render function that also has a provider
- `src/test-utils/index.tsx`
- we `import {ChakraProvider} from '@chakra-ui/react'`
- we `import { render as RtlRender } from '@testing-library/react'`
- by doing this, we can just `import test-utils/index.tsx` and it will be like we are importing `@testing-library/react` but we will have our `custom render` and `@testing-library`
- to the customRender() we can also pass an optional query client.

#### query client

```ts
//src/test-utils/index.tsx
import { ChakraProvider } from "@chakra-ui/react";
import { render as RtlRender } from "@testing-library/react";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { PropsWithChildren, ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";

// ** FOR TESTING CUSTOM HOOKS ** //
// from https://tkdodo.eu/blog/testing-react-query#for-custom-hooks
//make a function to generatea unique query for each test
export const createQueryClientWrapper = () => {
  const queryClient = generateQueryClient();
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const generateQueryClient = ()=>{
  return new QueryClient();
}

// reference: https://testing-library.com/docs/react-testing-library/setup#custom-render
function customRender(ui: ReactElement, client?:QueryClient) {
  const queryClient = client ?? generateQueryClient();  //if query client is not nullish, use it else generate a new one

  return RtlRender(
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

// re-export everything
// eslint-disable-next-line react-refresh/only-export-components
export * from "@testing-library/react";

// override render method
export { customRender as render };
```
#### 78. testing rendered query data
- note: `screen` is how we access the results of the render.
- the test function call for the getting the mock data is async (even though the data is from `mock-service-worker`)
- regex /i (case-insensitive)

```ts
//src/treatments/tests/Treatments.test.tsx

// import { render, screen } from "@testing-library/react";
//replace with `custom` render
import { render, screen } from '@/test-utils';

import { Treatments } from "../Treatments";

test("renders response from query", async () => {
  // write test here
  render(<Treatments/>);

  const treatmentTitles = await screen.findAllByRole("heading", {
    name: /massage|facial|scrub/i,  
  });

  expect(treatmentTitles).toHaveLength(3);  
});
```

### 79. test rendered staff data
- src/components/staff/tests/AllStaff.test.tsx

```ts
import { AllStaff } from "../AllStaff";

import { http, HttpResponse } from "msw";
import { render, screen } from "@/test-utils";
import { server } from '@/mocks/server';

test("renders response from query", async () => {
  render(<AllStaff/>);

  // (re)set handler to return a 500 error for staff and treatments
  server.use(
    http.get("http://localhost:3030/staff", () => {
      return new HttpResponse(null, { status: 500 });
    }),
    http.get("http://localhost:3030/treatments", () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const staffTitles = await screen.findAllByRole('heading', {
    name: /sandra|divya|mateo|michael/i
  });
  expect(staffTitles).toHaveLength(4);
});
```

### 80. testing query errors
- `src/components/staff/tests/AllStaff.error.test.tsx`
- we use mock service worker to mimic errors response from server
- error response for `/staff` and `/treatments`
- src/setupTest.js -> `afterEach(() => server.resetHandlers());` servers get reset after each test.
- we are testing if the alert pops up
- NOTE: src/react-query/queryClient.ts -> we update to export `queryClientOptions`, 

### query client options
```ts
//src/react-query/queryClient.ts
import { QueryClient, QueryCache, MutationCache, QueryClientConfig } from "@tanstack/react-query";

//...
export const queryClientOptions:QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 600000, //10minutes,
      gcTime: 900000, //15min - garbage collection time
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      //handle error
      const title = createTitle(error.message, "query");
      errorHandler(title);
    },
  }),

  mutationCache: new MutationCache({
    onError: (error) => {
      const title = createTitle(error.message, "mutation");
      errorHandler(title);
    },
  }),
};
//...
```
- then import `queryClientOptions` in `src/test-utils/index.tsx`

```ts
//src/test-utils/index.tsx
import { queryClientOptions } from "@/react-query/queryClient";

//...

const generateQueryClient = ()=>{
  queryClientOptions.defaultOptions.queries.retry = false;

  return new QueryClient(queryClientOptions);
}
```

### Error testing (turn off re-tries)
- in `AllStaff.error.test.tsx`
- with the queryClientOptions passed to QueryClient, we are able to get error passed in errorHandler() which shows the toast with the error.
- note: the `.findByRole('status')` is async as we wait for the status, but the test fails because of default test timeout test and retry query 3x times -> but this is too long
- NOTE: `src/react-query/queryClient.tsx` -> queryClientOptions was assigned the type `QueryClientConfig`
- FIX: in the test -> `src/test-utils/index.tsx` -> we can adjust re-tries in `queryClientOptions.defaultOptions.queries.retry` (see generateQueryClient())

```ts
//src/components/staff/tests/AllStaff.error.test.tsx
import { AllStaff } from "../AllStaff";
import { http, HttpResponse } from "msw";

import { render, screen } from "@/test-utils";
import { server } from '@/mocks/server';

test("renders response from query", async () => {
  render(<AllStaff/>);

// (re)set handler to return a 500 error for staff and treatments
  server.use(
    http.get("http://localhost:3030/staff", () => {
      return new HttpResponse(null, { status: 500 });
    }),
    http.get("http://localhost:3030/treatments", () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const alertToast = await screen.findByRole('status');
  expect(alertToast).toHaveTextContent(/could not fetch data/i);

});



```



