from random import Random
from time import sleep
from traceback import print_list
import aiohttp
import asyncio
import numpy as np
from models import Manager, Consumer, Privilage, Prosumer, User, Privilage

MAX_MANAGERS = 3
MAX_PROSUMERS = 10
MIN_MANAGERS = 1
MIN_PROSUMERS = 2
MAX_NUMBER_USERS = 3

GRID_SIZE = 64
NUMBER_REQUEST_AT_ONCE = 10


async def post(session, url, endpoint, body):
    async with session.post(url + endpoint, json=body) as resp:
        data = await resp.json()
        print(f"response: {resp.status}\n,body: {data}")
        return data


async def get(session, url, endpoint, data):
    async with session.get(url+endpoint) as resp:
        data = await resp.json()
        print(f"response: {resp.status}\n,body: {data}")
        return data


def insert_user(target_list, m, name):
    r = Random()
    target_list.append(
        User(name, m.id, [Privilage(5, "", m.id)], [], []))


async def main():
    grid = [[None]*GRID_SIZE]*GRID_SIZE
    users_managers = []
    users_prosumers = []
    consumers = []
    free_space = []
    managers = []
    prosumers = []
    r_sample = np.random.random_sample((GRID_SIZE, GRID_SIZE))
    r = Random()
    # TODO: Fix duplications with function abstractions
    for (j, col) in enumerate(r_sample):
        for (i, v) in enumerate(col):
            if(v < 0.001 and len(managers) < MAX_MANAGERS):
                m = Manager()
                if(len(users_managers) < MAX_NUMBER_USERS):
                    insert_user(users_managers, m, f"test{i}:{j}")
                else:
                    users_managers[r.randint(
                        0, len(users_managers) - 1)].managers.append(Privilage(5, "main", m.id))
                managers.append(m)
                grid[i][j] = m
            elif(v < 0.01 and len(prosumers) < MAX_PROSUMERS):
                p = Prosumer()
                if(len(users_prosumers) < MAX_NUMBER_USERS/2):
                    insert_user(users_prosumers, p, f"test{i}:{j}")
                else:
                    users_prosumers[r.randint(
                        0, len(users_prosumers) - 1)].prosumers.append(Privilage(5, "main", p.id))
                if len(users_managers) > 0:
                    users_managers[r.randint(0, len(
                        users_managers) - 1)].prosumers.append(Privilage(r.randint(2, 5), "manager", p.id))
                prosumers.append(p)
                grid[i][j] = p
            else:
                c = Consumer()
                consumers.append(c)
                grid[i][j] = c
                free_space.append((i, j))
    if(len(managers) < MIN_MANAGERS):
        for i in range(MIN_MANAGERS - len(managers)):
            m = Manager()
            if((len(users_managers)) < MAX_NUMBER_USERS/2):
                insert_user(users_managers, m, "extra_manager"+i)
            else:
                users_managers[r.randint(
                    0, len(users_managers) - 1)].managers.append(Privilage(5, "", m.id))
        i,j = free_space.pop()
        grid[i][j] = m
        managers.append(m)

    if(len(prosumers) < MIN_PROSUMERS):
        for i in range(MIN_PROSUMERS - len(prosumers)):
            p = Prosumer()
            if(len(users_prosumers) < MAX_NUMBER_USERS/2):
                insert_user(users_prosumers, p, "extra_prosumer"+i)
            else:
                users_prosumers[r.randint(
                    0, len(users_prosumers) - 1)].prosumers.append(Privilage(5, "", p.id))
            i,j = free_space.pop()
            prosumers.append(p)
            grid[i][j] = p
    
    toJson = lambda x: x.toJson()
    users = users_managers + users_prosumers
    users = list(map(toJson, users))
    # managers = list(map(toJson, managers))
    # prosumers = list(map(toJson, prosumers))
    # consumers = list(map(toJson, consumers))
    grid = list(map(lambda x: list(map(lambda y: toJson(y), x)), grid))

    print("Grid created")
   
    async with aiohttp.ClientSession() as session:
        # Change to admin user and password, aswell as the correct url off setup
        token = await post(session, "https://localhost:5025", "/api/login", {"username": "admin", "password": "admin"})
        for x in grid:
            for item in x:
                endpoint = ""
                match (type(item).__name__):
                    case "Consumer":
                        endpoint = "/members/consumer"
                    case "Prosumer":
                        endpoint = "/members/prosumer"
                    case "Manager":
                        endpoint = "/members/manager"
                asyncio.create_task(post(session, endpoint, item))


if __name__ == '__main__':
    asyncio.run(main())
