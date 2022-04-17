use serde::{Deserialize, Serialize};

use super::node::SimulationNode;

type TimeFn = [f64; 24];
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Consumer<'a> {
    timefn: TimeFn,
    profile: f64,
    node: SimulationNode<'a>,
}

impl<'a> Consumer<'a> {
    pub fn new(timefn: TimeFn, profile: Option<f64>, node: SimulationNode<'a>) -> Self {
        if let Some(p) = profile {
            Self {
                timefn,
                profile: p,
                node,
            }
        } else {
            let mut rng = rand::thread_rng();
            let r: f64 = rng.gen();
            let rd: f64 = rng.gen();

            // size is the number of individuals in a house hold as a real number, it is 2.7% weighted,
            let size = r * 4. - r * 2. + rd * 2. + 4.;
            // lamba is the variability of the the consumer to consume, this is much more weighted but tends to be a lower value.
            let lamba = r - r / 2. + rd / 2. + 1.;

            Self {
                timefn,
                profile: size * 0.027 + lamba * 0.5,
                node,
            }
        }
    }
        fn consumption(&self, temp: f32){
        let mut rng = rand::thread_rng();
        let now = Utc::now();
        let hour = now.hour24();

        self.profile * (0.002 * (294.15 - temp).powf(2) + self.timefn[hour])
    }
}



pub fn GenerateTimeFn() -> TimeFn {
    use rand::Rng;
    let random: f64 = rng.gen();
    return (
        0.02 * random,
        0.0114 * random,
        0.011 * random,
        0.05 * random,
        0.2 * random,
        0.35 * random,
        0.6 * random,
        0.8 * random,
        0.65 * random,
        0.64 * random,
        0.56 * random,
        0.58 * random,
        0.74 * random,
        0.56 * random,
        0.3 * random,
        0.2 * random,
        0.812 * random,
        0.911 * random,
        0.922 * random,
        0.926 * random,
        0.845 * random,
        0.76 * random,
        0.311 * random,
        0.121 * random,
    );
}
