import { Dispatch } from "redux";
import SimulationData from "../../../../models/SimulationData";
import { ActionTypes } from "../../types";
import {Action} from '../../types'

export const updateSimdata = (data : SimulationData) => (dispatch: Dispatch<Action>) => dispatch({
    type: ActionTypes.UpdateSimdata,
    payload: data,
}) 


export const resetSimdata= () => (dispatch: Dispatch<Action>) => dispatch({
    type: ActionTypes.ResetSimdata,
    payload: undefined,
}) 

