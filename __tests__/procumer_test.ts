import { Battery } from "../src/Procumer/Battery";
import { Procumer } from "../src/Procumer/procumer";
import { Turbine } from "../src/Procumer/Turbine";

test('procumer_test',()=>{
    let procumer = new Procumer([new Battery(1000, 51, 51)], [new Turbine(2000)]);
    procumer.input_ratio = 1;
    procumer.output_ratio = 0;
    procumer.tick(3);
    expect(procumer.totalProduction).toEqual(0);
    for (let index = 0; index < 100; index++) {
        procumer.tick(36);
        
        console.log(`batteries: ${procumer.currentCapacity()}/${procumer.totalCapacity}`)
        console.log(`output: ${procumer.totalProduction}`)
        if(procumer.totalCapacity === procumer.currentCapacity()){
            procumer.input_ratio = 0;
            procumer.output_ratio = 1;
        }
        if(procumer.currentCapacity() === 0)
        {
            procumer.input_ratio = 1;
            procumer.output_ratio = 0;
        }

        if(procumer.input_ratio === 0)
            expect(procumer.totalProduction).toBeGreaterThanOrEqual(2000);
        else if(procumer.currentCapacity() !== 0)
            expect(procumer.totalProduction).toBeLessThanOrEqual(2000);

        
    }
});

test('api_procumer_test',()=>{

});