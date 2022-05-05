import { CombinedState, combineReducers } from "redux";
import optionReducer from "./users";
import simdataReducer from "./simdata";
// import taskReducer from "./tasks";


const reducers = combineReducers({
    // tasks: taskReducer,
    options: optionReducer,
    simdata: simdataReducer,
})

export default reducers;
export type State = ReturnType<typeof reducers>