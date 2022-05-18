import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import UserData from "../../../models/userdata";
import { Action, ActionTypes } from "../../actions/types";

// Define the initial state using that type




export default function UserReducer(state: UserData, action: Action) {
    switch (action.type) {
        case ActionTypes.UpdateUser:
            return action.payload;
        case ActionTypes.ResetUser:
            return undefined;
        default:
            // console.log("fallthough!:", action)
            return state
    }
}
