
const ProsumerSchema = mongoose.Schema({
    totalProduction: Number,
    totalCapacity: Number,
    currentCapacity: Number,
    batteries: [{
        capacity: Number,
        current: Number,
        maxOutput: Number,
        maxCharge: Number
    }],
    turbines: [{
        maxPower: Number
    }],
    destination: String,
    status: Boolean,
    id: String,
});
 module.exports = ProsumerSchema;