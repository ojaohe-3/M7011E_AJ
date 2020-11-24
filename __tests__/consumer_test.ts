


import { Consumer } from "../src/Simulation/consumer";

test("consumption_test", () => {
    let consumer = new Consumer("1", ()=>{ return 1;});
    let consumer_2 = consumer;
    expect(consumer.consumption(273)).toBeLessThan(10);
    expect(consumer.consumption(250)).toEqual(consumer_2.consumption(250));
    for (let index = 0; index < 100; index++) {
        const c = new Consumer("${index}", ()=>{return 1;});
        
    }

});
