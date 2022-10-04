const AVERAGE_WINDOW_SIZE = 20;
const MAX_TRAFFIC_SIZE = 1_000;
export default class Monitor {
    private static _instant: Monitor | null = null;

    private _number_of_connections = 0;
    private _number_of_active_connections = 0;
    private _read_traffic = 0;
    private _rate_of_traffic = 0;
    private _write_traffic = 0;
    private _traffic: number[] = [];

    public static get instant(): Monitor {
        if (this._instant === null) {

            this._instant = new Monitor();
        }
        return this._instant;
    }

    public get rate_of_traffic() {
        return this._rate_of_traffic;
    }

    public get number_of_active_connections() {
        return this._number_of_active_connections;
    }
    public set number_of_active_connections(value) {
        this._number_of_active_connections = value;
    }

    public get read_traffic() {
        return this._read_traffic;
    }
    public set read_traffic(value) {
        this._read_traffic = value;
    }

    public get number_of_connections() {
        return this._number_of_connections;
    }
    public set number_of_connections(value) {
        this._number_of_connections = value;
    }

    public get write_traffic() {
        return this._write_traffic;
    }
    public set write_traffic(value) {
        this._write_traffic = value;
    }

    public get traffic_graph() {
        return this._traffic
    }

    public push_to_average(value: number) {
        this._traffic.push(value);
        if (this._traffic.length > MAX_TRAFFIC_SIZE) {
            this._traffic.splice(0, AVERAGE_WINDOW_SIZE); //remove last item window
        }
        const average = this._traffic.slice(-1 * AVERAGE_WINDOW_SIZE);
        let sum = 0;
        average.map(value => sum += value);
        this._rate_of_traffic = sum / average.length; // simple Moving average
    }
}