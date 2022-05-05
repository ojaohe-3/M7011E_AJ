import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import SimulationData from "../../../models/SimulationData";

import { Action } from "../../actions/types";
import { ActionTypes } from "../../actions/types";

// Define the initial state using that type
const initState: SimulationData = {
    width: 0,
    height: 0,
    nodes: []
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
