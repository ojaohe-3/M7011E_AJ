import { Dispatch } from "redux";
import SRP_Options from "../../../../models/Options";
import { ActionTypes, Action} from "../../types";

export const updateOptions = (options : SRP_Options) => (dispatch: Dispatch<Action>) => dispatch({
    type: ActionTypes.UpdateOption,
    payload: options,
}) 


export const resetOptions = () => (dispatch: Dispatch<Action>) => dispatch({
    type: ActionTypes.ResetOption,
    payload: undefined,
}) 

