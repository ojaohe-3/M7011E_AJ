import SimulationData from "../../../models/SimulationData";
import UserData from "../../../models/userdata";

export enum ActionTypes {
  UpdateUser = "updateUser",
  ResetUser = "resetUser",
  UpdateSimdata = "updateSimdata",
  ResetSimdata = "resetSimdata",
}
export interface UpdateUser {
  type: ActionTypes.UpdateUser;
  payload: UserData;
}
export interface ResetUser {
  type: ActionTypes.ResetUser;
  payload: undefined;
}

export interface UpdateSimdata {
  type: ActionTypes.UpdateSimdata;
  payload: SimulationData;
}

export interface ResetSimdata {
  type: ActionTypes.ResetSimdata;
  payload: undefined;
}

export type Action = UpdateUser | ResetUser | UpdateSimdata | ResetSimdata;
