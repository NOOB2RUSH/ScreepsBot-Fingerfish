
import { ROLE_HARVESTER, ROLE_MIB } from "creeps/creepConfiguration";

export function source_distributer_MIB(creep: Creep) {

    if (creep.memory.role == ROLE_MIB) {

        for (let i in creep.room.memory.list_source) {
            for (let j = 1; j < creep.room.memory.list_source[i].list_harvest_pos.length; j++)
            /**找到空闲的可采集点位 */ {
                if (creep.room.memory.list_source[i].list_harvest_pos[j].occupied == false) {
                    creep.room.memory.list_source[i].list_harvest_pos[j].occupied = true
                    creep.room.memory.list_source[i].list_harvest_pos[j].occupied_by = creep.name
                    creep.memory.harvest_pos = creep.room.memory.list_source[i].list_harvest_pos[j]
                    return
                }
            }
        }
    }
}

export function source_distributer_har(creep: Creep) {
    if (creep.memory.role == ROLE_HARVESTER) {
        for (let i in creep.room.memory.list_source) {
            creep.room.memory.list_source[i].list_harvest_pos[0]
            /**找到空闲的可采集点位 */ {
                if (creep.room.memory.list_source[i].list_harvest_pos[0].occupied == false
                    && creep.room.memory.list_source[i].list_harvest_pos[0].has_container == true) {
                    creep.room.memory.list_source[i].list_harvest_pos[0].occupied = true
                    creep.room.memory.list_source[i].list_harvest_pos[0].occupied_by = creep.name
                    creep.memory.harvest_pos = creep.room.memory.list_source[i].list_harvest_pos[0]
                    return
                }

            }
        }
    }
}
