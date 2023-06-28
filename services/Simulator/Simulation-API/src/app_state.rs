pub struct AppState{
    consumer_controller: ConsumerController,
    data_controller: DataController,
    grid_controller: GridController,
    manager_controller: ManagerController,
    prosumer_controller: ProsumerController,
}

impl AppState {
    pub fn new(consumer_controller: ConsumerController, data_controller: DataController, grid_controller: GridController, manager_controller: ManagerController, prosumer_controller: ProsumerController) -> Self { Self { consumer_controller, data_controller, grid_controller, manager_controller, prosumer_controller } }
}