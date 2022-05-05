import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import UserData from "../../../models/userdata";
import { Action, ActionTypes } from "../../actions/types";

// Define the initial state using that type
const initialState: UserData = {
    username: "anon"
}



export default function UserReducer(state = initialState, action: Action) {
    switch (action.type) {
        case ActionTypes.UpdateOption:
            return action.payload;
        case ActionTypes.ResetOption:
            return initialState;
        default:
            // console.log("fallthough!:", action)
            return state
    }
}
