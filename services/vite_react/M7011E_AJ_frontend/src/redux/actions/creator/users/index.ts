import { Dispatch } from "redux";
import { ActionTypes, Action} from "../../types";
import UserData from '../../../../models/userdata';
import { ResetUser, UpdateUser } from '../../types/index';

export const updateUser = (user: UserData) => (dispatch: Dispatch<Action>) => dispatch({
    type: ActionTypes.UpdateUser,
    payload: user,
}) 


export const resetOptions = () => (dispatch: Dispatch<Action>) => dispatch({
    type: ActionTypes.ResetUser,
    payload: undefined,
}) 

