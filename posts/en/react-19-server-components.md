# The Paradigm Shift

React 19 Server Components (RSC) represent the most significant change to the React mental model since the introduction of Hooks.

## Why RSC?

The primary goal is **performance** and **developer experience**. By moving data fetching to the server:

1. **Zero Bundle Size**: Code used only on the server doesn't get shipped to the client.
2. **Direct Backend Access**: No more complex API layers for internal data fetching.
3. **Automatic Code Splitting**: Server components naturally lead to better chunking.

### A Practical Example

```javascript
// This runs on the server
async function UserProfile({ id }) {
  const user = await db.users.get(id); // Direct DB call!
  return <div>{user.name}</div>;
}
```

## The Zen of Minimalism

In my recent projects, adopting this pattern has reduced client-side bundles by nearly 30%, proving that sometimes, doing less is actually doing more.