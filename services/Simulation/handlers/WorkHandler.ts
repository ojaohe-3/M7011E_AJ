export type Handler<T> = (arg? : T) => void

export interface Worker<T>{
    on: (key: string, handler: Handler<T>) => Worker<T>
    off: (key: string) => Worker<T>
}

export default class WorkHandler<T> implements Worker<T>{
    private _handlers: Map<string, Handler<T>[]>

    constructor(){
        this._handlers = new Map();

    }
    
    on(key: string, handler: Handler<T>){
        if(this._handlers.has(key)){
            const handlers = this._handlers.get(key);
            handlers?.push(handler);
            this._handlers.set(key, handlers!);

        }else{
            this._handlers.set(key, [handler]);
        }
        return this;
    }
    off(key: string){
        this._handlers.delete(key);
        return this;
    }

    run(key: string, args?: T){
        const handler = this._handlers.get(key);
        if(handler){
            handler.forEach(h => h(args));
        }
    }
    runAll(args?: T){
        this._handlers.forEach((hs) => hs.forEach(h => h(args)))    
    }
}