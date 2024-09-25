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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
  const response = await fetch('');
  throw new Error('new error'); //'error' message is also usable with react-query
}
```

```js
//src/Posts.jsx
import { fetchPosts, deletePost, updatePost } from './api'; //query function
import { useQuery, isLoading, isError, error } from '@tanstack/react-query';

//...
const { data } = useQuery({
  queryKey: ['posts'],
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

- isFetching -> async query hasnt resolved
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
import { ReactQueryDevTools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
import { fetchPosts, deletePost, updatePost } from './api'; //query function
import { useQuery, isLoading, isError, error } from '@tanstack/react-query';

//...
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 2000
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
import { useQuery } from '@tanstack/react-query';

import "./PostDetail.css";

export function PostDetail({ post }) {

  const { data, isLoading, isError, error} = useQuery({
    queryKey: ["comments"],
    queryFn: () => fetchComments(post.id)
  });

  if(isLoading){
    return <h3>Loading...</h3>
  }

  if(isError){
    return (
      <>
        <h3>oops, error</h3>
        <p>{error.toString()}</p>
      </>
    )
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
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchPosts, deletePost, updatePost } from './api';
import { PostDetail } from './PostDetail';

const maxPostPage = 10;

export function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);

  // replace with useQuery
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['posts', currentPage],
    queryFn: ()=> fetchPosts(currentPage),
    staleTime: 2000
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
          <li key={post.id} className='post-title' onClick={() => setSelectedPost(post)}>
            {post.title}
          </li>
        ))}
      </ul>
      <div className='pages'>
        <button disabled={ currentPage <=1 } onClick={() => setCurrentPage(previousValue => previousValue - 1 )}>
          Previous page
        </button>
        <span>Page {currentPage}</span>
        <button disabled={currentPage >= maxPostPage } onClick={() => setCurrentPage(previousValue => previousValue + 1 )}>
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
import {useEffect} from 'react';

import { useQuery, useQueryClient} from '@tanstack/react-query';

//...
export function Posts(){
  const {currentPage, setCurrentPage} = useState(1);
  const queryClient = useQueryClient();

  useEffect(()=>{
    const nextPage = currentPage + 1;

    queryClient.prefetchQuery({
      queryKey: ["posts", nextPage],
      queryFn: ()=> fetchPosts(nextPage)
    });
  }, [currentPage, queryClient]);

  if(isFetching){
    //this will show everytime regardless if there is cached data
  }

  if(isLoading){
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