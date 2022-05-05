import { Dispatch } from "redux";
import { Tasks } from "../../../../models";
import { ActionTypes } from "../../types";
import {Action} from '../../types'

export const updateTasks = (tasks : Tasks) => (dispatch: Dispatch<Action>) => dispatch({
    type: ActionTypes.UpdateTasks,
    payload: tasks,
}) 


export const resetTasks = () => (dispatch: Dispatch<Action>) => dispatch({
    type: ActionTypes.ResetTasks,
    payload: undefined,
}) 

