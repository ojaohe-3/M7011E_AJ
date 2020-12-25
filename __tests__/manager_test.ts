import { Manager } from "../src/Manager/Manager";
test("manager_test",async ()=>{

    jest.setTimeout(1000000);
    const manager = new Manager("a", 1000);
    manager.setActive();
    console.log("testing acceleration");
    await manager.Produce(1.1);
    expect(manager.current).toEqual(manager.maxProduciton);
    manager.status = false;
    console.log("testing de acceleration");
    await manager.Produce(1.1);
    expect(manager.current).toEqual(0);


});
test("manager_api_test",()=>{
});