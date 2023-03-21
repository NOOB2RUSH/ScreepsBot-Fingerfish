
import { ROLE_MIB, IDLE, WORKING, RETURNING, ROLE_UPGRADER, ROLE_HARVESTER, ROLE_CARRIER } from "creeps/creepConfiguration";
import { source_distributer_har, source_distributer_MIB } from "rooms/sourceDistributer"

/*
仅仅在游戏开始阶段启用的creep
同时具有采矿与运输的功能
*/
export var role_MIB = {
    run: function (creep: Creep) {
        if (creep.memory.role == ROLE_MIB) {
            switch (creep.memory.stats) {
                case WORKING:

                    /**如果没有走到工作位置，则走过去 */
                    var work_pos = new RoomPosition(creep.memory.harvest_pos.pos.x, creep.memory.harvest_pos.pos.y, creep.room.name)
                    if (creep.pos.x != work_pos.x || creep.pos.y != work_pos.y) {
                        creep.moveTo(
                            work_pos,
                            { reusePath: 10, visualizePathStyle: {} })
                    }
                    else {
                        creep.harvest(Game.getObjectById(creep.memory.harvest_pos.link_source))
                    }
                    /**存满了就转换为运送模式 */
                    if (creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
                        creep.memory.stats = RETURNING
                        break;
                    }
                    break;
                case RETURNING:
                    if (!creep.memory.harvest_pos) { source_distributer_MIB(creep) }
                    /**存好了就去干活 */
                    if (creep.memory.harvest_pos) {
                        if (creep.store[RESOURCE_ENERGY] < creep.store.getCapacity()) {
                            creep.memory.stats = WORKING
                            break;
                        }
                        /**此处暂时使用storage代替
                         * 应用一个包含了所有可到达的储存设备的列表取代此处
                         */
                        var storage = Game.spawns['Spawn1']
                        if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(storage.pos, { reusePath: 10, visualizePathStyle: {} })
                        }
                        else {
                            break;
                        }
                    }

            }
        }
    }
}


/**upgrader用于给房间controller升级 */

export var role_upgrader = {
    run: function (creep: Creep) {
        if (creep.memory.role == ROLE_UPGRADER) {
            switch (creep.memory.stats) {
                case WORKING:
                    //空了就返回
                    if (creep.store[RESOURCE_ENERGY] == 0) {
                        creep.memory.stats = RETURNING
                        break;
                    }
                    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller.pos, { reusePath: 10, visualizePathStyle: {} })
                    }
                    else {
                        break;
                    }
                case RETURNING:
                    /**拿好了就去干活 */
                    if (creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
                        creep.memory.stats = WORKING
                        break;
                    }
                    var storage = Game.getObjectById(creep.room.memory.list_container_avail[0].id)
                    if (creep.room.storage) { storage = creep.room.storage }
                    if (storage.structureType == STRUCTURE_SPAWN && storage.store[RESOURCE_ENERGY] < 300) { break }
                    if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storage.pos, { reusePath: 10, visualizePathStyle: {} })
                    }
                    else {
                        break;
                    }
            }
        }
    }
}

/**harvester
 * 专职负责挖矿，无carry部件
 */

export var role_harvester = {
    run: function (creep: Creep) {
        if (creep.memory.role == ROLE_HARVESTER) {
            switch (creep.memory.stats) {
                case RETURNING:

                    creep.memory.stats = WORKING
                    break;
                case WORKING:
                    if (!creep.memory.harvest_pos) {
                        source_distributer_har(creep)
                    }
                    else {
                        var work_pos = new RoomPosition(creep.memory.harvest_pos.pos.x, creep.memory.harvest_pos.pos.y, creep.room.name)
                        if (creep.pos.x != work_pos.x || creep.pos.y != work_pos.y) {
                            creep.moveTo(
                                work_pos,
                                { reusePath: 10, visualizePathStyle: {} })
                        }
                        else {
                            creep.harvest(Game.getObjectById(creep.memory.harvest_pos.link_source))
                        }
                    }
            }
        }
    }
}

/**carrier
 * 专职负责运输的creep
 * WORKING:已经收集完毕，正在运往目的地
 * RETURNING:能量耗尽，前去收集
 * IDLE：暂时没有需要能量的地方，待命
 */

export var role_carrier = {
    //从某地取得能量
    withdraw_from(creep: Creep, giver: Id<StructureContainer | StructureSpawn | StructureExtension | StructureStorage>) {
        let target = Game.getObjectById(giver)
        if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target.pos.x, target.pos.y,
                {
                    reusePath: 5, visualizePathStyle: {}
                })
        }
        //收集满了，去送能量
        else if (creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
            creep.memory.stats = WORKING
        }
    },
    //向某对象给出能量
    give_to(creep: Creep, receiver: Id<StructureSpawn | StructureExtension | StructureStorage | Creep>) {
        let target = Game.getObjectById(receiver)
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target.pos.x, target.pos.y,
                {
                    reusePath: 5, visualizePathStyle: {}
                })
        }
        //能量送完，去收集能量
        else if (creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.stats = RETURNING
        }
    }
}



/**builder
 * 专职建造的creep
 */
export var role_builder = {
    //从某地取得能量
    withdraw_from(creep: Creep, giver: Id<StructureContainer | StructureSpawn | StructureExtension | StructureStorage>) {
        let target = Game.getObjectById(giver)
        if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target.pos.x, target.pos.y,
                {
                    reusePath: 5, visualizePathStyle: {}
                })
        }
        //收集满了，去建筑
        else if (creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
            creep.memory.stats = WORKING
        }
    },
    build(creep: Creep, construction_site: Id<ConstructionSite>) {
        let target = Game.getObjectById(construction_site)
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target.pos.x, target.pos.y,
                {
                    reusePath: 5, visualizePathStyle: {}
                })
        }
        //能量用完了就去收集
        else if (creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.stats = RETURNING
        }

    }
}


/**scout
 * 负责开新房间视野
 *
 */
export var role_scout = {
    run: function (creep: Creep) {
        if (creep.memory.scout_target) {
            // if (!Game.rooms[creep.memory.scout_target] || creep.pos.x == (0 || 49) || creep.pos.y == (0 || 49)) {
                let tar = new RoomPosition(24, 24, creep.memory.scout_target)
                creep.moveTo(tar, { visualizePathStyle: {} })
        }
    }
}
