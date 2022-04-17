pub mod prosumer{
    pub struct Turbine{
        maxProduction: f32
    }
    pub struct Battery{
        capacity: f32,
        current: f32,
        maxCharge: f32,
        maxOutput: f32,
    }
    
    pub struct Prosumer{
        status: bool,
        batteries: Vec<Battery>,
        turbine: Vec<Turbine>,
        input_ratio: f32,
        output_ratio: f32,
        // timeout: Duration
    }

}    
