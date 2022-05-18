import { CombinedState, combineReducers } from "redux";
import UserReducer from "./users";
import simdataReducer from "./simdata";
// import taskReducer from "./tasks";


const reducers = combineReducers({
    // tasks: taskReducer,
    user: UserReducer,
    // simdata: simdataReducer,
})

export default reducers;
export type State = ReturnType<typeof reducers>