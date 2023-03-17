import { ROLE_MIB, ROLE_UPGRADER, ROLE_BUILDER, IDLE, RETURNING, ROLE_REPAIRER, ROLE_CARRIER, ENERGY_LOWER_LIMIT, creepConfig, MIB_CFG, UPGRADER_CFG, BUILDER_CFG, REPAIRER_CFG, CARRIER_CFG } from "creeps/creepConfiguration"
import { role_MIB, role_upgrader, role_builder, role_carrier } from "creeps/roleFunctions"
import { body_resolve } from "utils/misc"

//控制所有creep的生产
export function spawnController(spawn: StructureSpawn) {
    /**检查初代机数量，小于最大值则尝试生成
    此处应注意加入房间等级判断，仅在房间为低等级时使用
    在房间升级后修改此处代码
    */

    if (spawn.room.memory.creep_count.MIB < creepConfig[MIB_CFG].max_count) {
        for (let i in Game.spawns) {
            let creep_name = ('MIB' + '_' + Game.time) as string
            if (Game.spawns[i].spawnCreep(body_resolve(creepConfig[MIB_CFG].body_parts[1]), creep_name) == OK) {
                let creep: Creep = Game.creeps[creep_name]
                //为初代机分配内存
                creep.memory = {
                    role: ROLE_MIB,
                    stats: RETURNING
                }
                console.log('成功生产' + creep_name)
            }
        }
    }
    //upgrader
    if (spawn.room.memory.creep_count.upgrader < creepConfig[UPGRADER_CFG].max_count
        && spawn.room.memory.creep_count.MIB == creepConfig[MIB_CFG].max_count
        && spawn.room.energyAvailable >= ENERGY_LOWER_LIMIT[1]) {
        for (let i in Game.spawns) {
            let creep_name = ('upgrader' + '_' + Game.time) as string
            if (Game.spawns[i].spawnCreep(body_resolve(creepConfig[UPGRADER_CFG].body_parts[1]), creep_name) == OK) {
                let creep: Creep = Game.creeps[creep_name]
                creep.memory = {
                    role: ROLE_UPGRADER,
                    stats: RETURNING
                }
                console.log('成功生产' + creep_name)
            }
        }

    }
    //builder
    if (spawn.room.memory.creep_count.builder < creepConfig[BUILDER_CFG].max_count
        && spawn.room.memory.creep_count.MIB == creepConfig[MIB_CFG].max_count
        && spawn.room.memory.list_construction.length > 0
        && spawn.room.energyAvailable >= ENERGY_LOWER_LIMIT[1]) {
        for (let i in Game.spawns) {
            let creep_name = ('builder' + '_' + Game.time) as string
            if (Game.spawns[i].spawnCreep(body_resolve(creepConfig[BUILDER_CFG].body_parts[1]), creep_name) == OK) {
                let creep: Creep = Game.creeps[creep_name]
                creep.memory = {
                    role: ROLE_BUILDER,
                    stats: RETURNING
                }
                console.log('成功生产' + creep_name)
            }
        }
    }
    //repairer
    if (spawn.room.memory.creep_count.repairer < creepConfig[REPAIRER_CFG].max_count
        && spawn.room.memory.creep_count.MIB == creepConfig[MIB_CFG].max_count
        && spawn.room.memory.list_repair.length > 0
        && spawn.room.energyAvailable >= ENERGY_LOWER_LIMIT[1]
    ) {
        for (let i in Game.spawns) {
            let creep_name = ('repairer' + '_' + Game.time) as string
            if (Game.spawns[i].spawnCreep(body_resolve(creepConfig[REPAIRER_CFG].body_parts[1]), creep_name) == OK) {
                let creep: Creep = Game.creeps[creep_name]
                creep.memory = {
                    role: ROLE_REPAIRER,
                    stats: RETURNING
                }
                console.log('成功生产' + creep_name)
            }
        }
    }

    //carrier
    if (spawn.room.memory.creep_count.carrier < creepConfig[CARRIER_CFG].max_count
        && spawn.room.memory.creep_count.MIB == creepConfig[MIB_CFG].max_count
    ) {
        for (let i in Game.spawns) {
            let creep_name = ('carrier' + '_' + Game.time) as string
            if (Game.spawns[i].spawnCreep(body_resolve(creepConfig[CARRIER_CFG].body_parts[1]), creep_name) == OK) {
                let creep: Creep = Game.creeps[creep_name]
                creep.memory = {
                    role: ROLE_CARRIER,
                    stats: RETURNING
                }
                console.log('成功生产' + creep_name)
            }
        }
    }
}
