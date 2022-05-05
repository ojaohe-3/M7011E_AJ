import { Tasks } from "../../../models"
import SRP_Options from "../../../models/Options"
import SimulationData from "../../../models/SimulationData"

export enum ActionTypes{
    UpdateOption = "updateOption",
    ResetOption = "resetOption",
    UpdateTasks = "updateTasks",
    ResetTasks = "resetTasks",
    UpdateSimdata = "updateSimdata",
    ResetSimdata= "resetSimdata",
}
export interface UpdateOption{
    type: ActionTypes.UpdateOption,
    payload: SRP_Options
}
export interface ResetOption{
    type: ActionTypes.ResetOption,
    payload: undefined
}

export interface UpdateTasks{
    type: ActionTypes.UpdateTasks,
    payload: Tasks
}
export interface ResetTasks{
    type: ActionTypes.ResetTasks,
    payload: undefined
}

export interface UpdateSimdata{
    type: ActionTypes.UpdateSimdata,
    payload: SimulationData
}

export interface ResetSimdata{
    type: ActionTypes.ResetSimdata,
    payload: undefined
}

export type Action =  UpdateOption | ResetOption | UpdateTasks | ResetTasks | UpdateSimdata | ResetSimdata