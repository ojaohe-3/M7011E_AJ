


import { Consumer } from "../src/Simulation/consumer";

test("consumption_test", () => {
    let consumer = new Consumer("1", ()=>{ return 1;});
    let consumer_2 = consumer;
    expect(consumer.consumption(273)).toBeLessThan(4);
    expect(consumer.consumption(250)).toEqual(consumer_2.consumption(250));
    let max = 0;
    let min = Number.MAX_VALUE;
    let res = [];
    for (let index = 0; index < 100; index++) {
        const c = new Consumer("${index}", ()=>{return Math.random();});
        const cons = c.consumption(273);
        expect(cons).toBeLessThan(4);
        max = Math.max(cons, max);
        min = Math.min(min, cons);
        res.push(cons);

        
    }
    let mean = ()=>{
        let sum = 0;
        res.forEach((v)=> sum +=v);
        return sum/res.length;
    };
    console.log(mean());
    console.log(max);
    console.log(min);

});

test("consumer_api_test",()=>{
});