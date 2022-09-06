from random import Random
import uuid
from dataclasses import dataclass


@dataclass
class Battery:
    capacity: float = 0  # in kwh
    current: float = 0  # current power in batteries
    maxOutput: float = 0  # maximum output in kwh
    maxCharge: float = 0  # m

    def toJson(self) -> dict:
        return {"capacity": self.capacity, "current": self.current, "maxOutput": self.maxOutput, "maxCharge": self.maxCharge}


@dataclass
class Turbine:
    maxPower: float = 0

    def toJson(self) -> dict:
        return {"maxPower": self.maxPower}


@dataclass
class Privilage:
    level: int
    access: str
    id: str
    type: str
    def toJson(self) -> dict:
        return {
            "level": self.level,
            "access": self.access,
            "id": self.id,
            "type": self.type
        }


@dataclass
class User:
    username: str
    main: str
    managers: list[Privilage]
    prosumers: list[Privilage]
    consumers: list[Privilage]
    _id: str = str(uuid.uuid4())
    password: str = "test"
    
    def toJson(self) -> dict:
        def _toJson(x): return x.toJson()
        return {
            "username": self.username,
            "main": self.main,
            "managers": map(_toJson, self.managers),
            "prosumers": map(_toJson, self.prosumers),
            "consumers": map(_toJson, self.consumers),
            "_id": self._id
        }


class Consumer:
    id = str(uuid.uuid4())
    timefn = []

    def __init__(self):

        r = Random()
        self.timefn = [r.random() * r.randrange(1, 10)] * 24

    def toJson(self) -> dict:
        return {"id": self.id, "timefn": self.timefn}


class Manager:
    maxProduction = 0
    id = str(uuid.uuid4())

    def __init__(self) -> None:
        self.maxProduction = 10000

    def toJson(self) -> dict:
        return {"id": self.id, "maxProduction": self.maxProduction}


class Prosumer:
    batteries = []
    turbines = []
    id = str(uuid.uuid4())

    def __init__(self):
        r = Random()

        nB = r.randint(1, 10)
        nT = r.randint(1, 20)
        for b in range(nB):
            self.batteries.append(Battery(capacity=r.random() * 1000 + 1, current=0,
                               maxOutput=r.random() * 100,  maxCharge=r.random() * 100).toJson())
        for b in range(nT):
            self.turbines.append(Turbine(maxPower=r.random()*500).toJson())

    def toJson(self) -> dict:
        return {"id": self.id,
                "turbines": self.turbines,
                "batteries": self.batteries
                }
