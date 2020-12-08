
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
    name: String,
    status: Boolean,
});
 module.exports = mongoose.model('Prosumer', ProsumerSchema);