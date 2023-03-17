import { ROLE_MIB, ROLE_UPGRADER } from "creeps/creepConfiguration"
import { AnyTxtRecord } from "dns"
import { memoize } from "lodash"

/**用于处理creep死亡后，清理内存相关事宜 */
export function memoryUnleasher() {
    //清空死亡creep所连接到的采集点
    for (let i in Game.rooms) {
        for (let j in Game.rooms[i].memory.list_source) {
            for (let n in Game.rooms[i].memory.list_source[j].list_harvest_pos) {
                let pos = Game.rooms[i].memory.list_source[j].list_harvest_pos[n]
                if (pos.occupied) {
                    if (!Game.creeps[pos.occupied_by]) {
                        Game.rooms[i].memory.list_source[j].list_harvest_pos[n].occupied_by = null
                        Game.rooms[i].memory.list_source[j].list_harvest_pos[n].occupied = false
                    }
                }
            }
        }
    }
    // Automatically delete memory of missing creeps
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    for (let name in Memory.rooms) {
        if (!Game.rooms[name]) {
            delete Memory.rooms[name]
        }
    }
    for (let name in Game.rooms) {
        let room = Game.rooms[name]
        let check_valid = (room: Room, list: string, par?: string): void => {
            let mem_list = []
            if (par) {
                mem_list = room.memory[list][par]
            }
            else {
                mem_list = room.memory[list]
            }
            for (let i in mem_list) {
                if (!Game.getObjectById(mem_list[i])) {
                    if (par) {
                        room.memory[list][par].splice(i, 1)
                    }
                    else {
                        mem_list = room.memory[list].splice(i, 1)
                    }
                }
            }
        }
        //check_valid(Game.rooms[name], 'list_container_avail')
    }
}




