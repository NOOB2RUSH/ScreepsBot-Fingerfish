import { ROLE_HARVESTER, ROLE_MIB, ROLE_SCOUT, ROLE_UPGRADER } from "creeps/creepConfiguration";
import { role_harvester, role_MIB, role_scout, role_upgrader } from "./roleFunctions"
export function runCreepEveryTick() {
    for (let name in Game.creeps) {
        var creep = Game.creeps[name]
        switch (creep.memory.role) {
            case ROLE_MIB:
                role_MIB.run(creep)

                break;
            case ROLE_UPGRADER:
                role_upgrader.run(creep)
                break;
            case ROLE_HARVESTER:
                role_harvester.run(creep)
                break;
            case ROLE_SCOUT:
                role_scout.run(creep)
                break;

        }


    }
}
