import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { Action } from "../../actions/types";
import { ActionTypes } from "../../actions/types";

// Define the initial state using that type
const initState: SimulationData = {
    // res: [],
    // bps:  null, 
    // load_factor: 0,
}




export default function simdataReducer(state = initState, action: Action) {
    switch (action.type) {
        case ActionTypes.UpdateSimdata:
            return action.payload;
        case ActionTypes.ResetSimdata:
            return initState;
        default:
            // console.log("fallthough!:", action)
            return state
    }
}
