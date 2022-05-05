import { applyMiddleware, configureStore, createStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk';
import reducers from './reducers';

const store = createStore(
  reducers,
  {},
  applyMiddleware(thunk)
)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
export default store;