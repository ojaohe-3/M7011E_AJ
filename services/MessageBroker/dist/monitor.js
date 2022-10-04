"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AVERAGE_WINDOW_SIZE = 20;
const MAX_TRAFFIC_SIZE = 1000;
let Monitor = (() => {
    class Monitor {
        constructor() {
            this._number_of_connections = 0;
            this._number_of_active_connections = 0;
            this._read_traffic = 0;
            this._rate_of_traffic = 0;
            this._write_traffic = 0;
            this._traffic = [];
        }
        static get instant() {
            if (this._instant === null) {
                this._instant = new Monitor();
            }
            return this._instant;
        }
        get rate_of_traffic() {
            return this._rate_of_traffic;
        }
        get number_of_active_connections() {
            return this._number_of_active_connections;
        }
        set number_of_active_connections(value) {
            this._number_of_active_connections = value;
        }
        get read_traffic() {
            return this._read_traffic;
        }
        set read_traffic(value) {
            this._read_traffic = value;
        }
        get number_of_connections() {
            return this._number_of_connections;
        }
        set number_of_connections(value) {
            this._number_of_connections = value;
        }
        get write_traffic() {
            return this._write_traffic;
        }
        set write_traffic(value) {
            this._write_traffic = value;
        }
        get traffic_graph() {
            return this._traffic;
        }
        push_to_average(value) {
            this._traffic.push(value);
            if (this._traffic.length > MAX_TRAFFIC_SIZE) {
                this._traffic.splice(0, AVERAGE_WINDOW_SIZE);
            }
            const average = this._traffic.slice(-1 * AVERAGE_WINDOW_SIZE);
            let sum = 0;
            average.map(value => sum += value);
            this._rate_of_traffic = sum / average.length;
        }
    }
    Monitor._instant = null;
    return Monitor;
})();
exports.default = Monitor;
