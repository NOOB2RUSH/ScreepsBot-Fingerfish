import { ROLE_MIB, ROLE_UPGRADER, ROLE_BUILDER, ROLE_CARRIER, RETURNING, WORKING, ROLE_REPAIRER, creepConfig, MIB_CFG, creepCfgMap, ROLE_HARVESTER } from "creeps/creepConfiguration";

import { body_resolve, my_some } from "utils/misc";
/**定义不同建筑需求能量的优先级，1最高 */
const energy_input_priority = {
    extension: 1,
    spawn: 2,
    storage: 6,
    upgrader: 5,
    tower: 4

}
const energy_output_priority = {
    container: 1,
    storage: 2,
    spawn: 3,
}

const build_priority = {
    container: 1,
    extension: 2,
    storage: 3,
    tower: 4,
    link: 5,
    terminal: 6,
    factory: 7,
    observer: 7,
    powerSpawn: 7,
    extractor: 7,
    nuker: 7,
    spawn: 7,
    lab: 7,
    rampart: 8,
    wall: 9,
    road: 10,
}

const RAMPART_MAX_HIT = 20000


export function mount_room() {
    _.assign(Room.prototype, roomExtention)
}
export const roomExtention = {

    /**
     * 遍历该房间内所有creep并储存在内存里
     */
    find_creep(this: Room) {
        this.memory.creep_count = {
            MIB: 0,
            upgrader: 0,
            builder: 0,
            carrier: 0,
            repairer: 0,
            harvester: 0,
        }
        let creep_list = this.find(FIND_MY_CREEPS)
        for (let i = 0; i < creep_list.length; i++) {
            switch (creep_list[i].memory.role) {
                case ROLE_MIB:
                    this.memory.creep_count.MIB += 1
                    break;
                case ROLE_UPGRADER:
                    this.memory.creep_count.upgrader += 1
                    break;
                case ROLE_BUILDER:
                    this.memory.creep_count.builder += 1
                    break;
                case ROLE_CARRIER:
                    this.memory.creep_count.carrier += 1
                    break;
                case ROLE_REPAIRER:
                    this.memory.creep_count.repairer += 1
                    break;
                case ROLE_HARVESTER:
                    this.memory.creep_count.harvester += 1
                    break;
            }
            if (!this.memory.creeps) { this.memory.creeps = [] }
            if (this.memory.creeps) {
                if (this.memory.creeps.length == 0) {
                    this.memory.creeps.push(creep_list[i].name)
                }
                for (let j in this.memory.creeps) {
                    //先清空已经死了的creep
                    if (!Game.creeps[this.memory.creeps[j]]) {
                        this.memory.creeps.splice(j as unknown as number, 1)
                        continue
                    }
                    //发现该creep已经存在在列表中
                    if (creep_list[i].name == this.memory.creeps[j]) {
                        break
                    }
                    if (j as unknown as number == this.memory.creeps.length - 1) {
                        this.memory.creeps.push(creep_list[i].name)
                    }
                }
            }

        }





    },

    /**若发现有尚未完工的工地，查找该工地是否已经被加入工作列表，若否，则加入列表*/
    construct_job_finder(this: Room) {
        /**工地对象列表 */
        let list = this.find(FIND_MY_CONSTRUCTION_SITES)
        if (list.length > 0) {

            //防止未初始化报错
            if (!this.memory.list_construction) { this.memory.list_construction = [] }
            let current_list = this.memory.list_construction
            for (let i in list) {

                //如果列表中没有已经记录的工地，直接加入
                if (current_list.length == 0) {
                    this.memory.list_construction.push({ id: list[i].id, priority: build_priority[list[i].structureType] })
                }
                for (let j in current_list) {
                    //发现该工地已经存在在内存工作列表中
                    if (list[i].id == current_list[j].id) {
                        break
                    }
                    if (j as unknown as number == current_list.length - 1) {
                        this.memory.list_construction.push({ id: list[i].id, priority: build_priority[list[i].structureType] })
                    }
                }
            }

        }
        /**对建筑列表按照优先级排序 */
        this.memory.list_construction.sort((a, b) => a.priority - b.priority)



    },
    /**遍历当前房间所有未被分配的建筑任务，将任务分配给builder */
    construct_job_giver(this: Room) {
        let list_job = this.memory.list_construction

        for (let i in list_job) {
            //找到可用的建筑工地
            if (Game.getObjectById(list_job[i].id) != null) {


                for (let j in this.memory.creeps) {
                    let creep = Game.creeps[this.memory.creeps[j]]
                    if (creep) {
                        if (creep.memory.role == ROLE_BUILDER) {
                            switch (creep.memory.stats) {
                                case WORKING: creep.my_build(list_job[0].id)
                                    break;
                                case RETURNING:
                                    if (this.storage) {
                                        creep.withdraw_from(this.storage.id)
                                        break
                                    }
                                    creep.withdraw_from(this.memory.list_container_avail[0].id)
                                    break;
                            }
                        }
                    }
                }
                break;
            }
            else {
                this.memory.list_construction.splice(i as unknown as number, 1)
            }
        }
    },
    /**分配搬运任务
     *
     */
    carry_job_distributer(this: Room) {
        //1.检查可用的能量源
        let list_container: (StructureContainer | StructureStorage)[] = this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } })
        if (this.storage) { list_container.push(this.storage) }
        if (!this.memory.list_container_avail) {
            this.memory.list_container_avail = []
        }
        if (list_container.length > 0) {
            for (let i in list_container) {
                //提取所存有的能量大于一定量的建筑物
                if (list_container[i].store[RESOURCE_ENERGY] > 500) {
                    let push = {
                        id: list_container[i].id,
                        priority: energy_output_priority[list_container[i].structureType]
                    }                //如果内存中列表本来就是空的，直接加入
                    if (this.memory.list_container_avail.length == 0) {

                        this.memory.list_container_avail.push(push)
                        continue
                    }//如果内存中没有该container，则加入
                    let tempArr = []
                    for (let j in this.memory.list_container_avail) {
                        tempArr[j] = this.memory.list_container_avail[j].id
                    }
                    if (!my_some(tempArr, list_container[i].id)) {

                        this.memory.list_container_avail.push(push)
                    }

                }
            }
        }





        var list_spawn: StructureSpawn[] = this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } })
        //若执行完后可用container数量依然为0了，则尝试将spawn中能量移动到ext中

        if (this.memory.list_container_avail.length == 0) {
            for (let i in list_spawn) {
                this.memory.list_container_avail.push({ id: list_spawn[i].id, priority: energy_output_priority[list_spawn[i].structureType] })
            }
        }
        else {
            for (let i in this.memory.list_container_avail) {
                if (!Game.getObjectById(this.memory.list_container_avail[i].id)) {
                    this.memory.list_container_avail.splice(i as unknown as number, 1)
                    continue
                }
                if (list_spawn.length < this.memory.list_container_avail.length &&
                    Game.getObjectById(this.memory.list_container_avail[i].id).structureType == STRUCTURE_SPAWN) {
                    this.memory.list_container_avail.splice(i as unknown as number, 1)
                    list_spawn.splice(0, 1)
                }
            }
        }

        //检索已经保存的可用container，若能量归零则移除
        for (let i in this.memory.list_container_avail) {
            if (Game.getObjectById(this.memory.list_container_avail[i].id).store[RESOURCE_ENERGY] < 150 &&
                Game.getObjectById(this.memory.list_container_avail[i].id).structureType != STRUCTURE_SPAWN) {
                this.memory.list_container_avail.splice(i as unknown as number, 1)
            }
        }
        this.memory.list_container_avail.sort((a, b) => a.priority - b.priority)



        //2.检查需要能量的建筑
        //优先检查spawn和extension
        let list_receiver: (StructureSpawn | StructureExtension | StructureStorage | StructureTower)[] = this.find(FIND_MY_STRUCTURES,
            {
                filter: (x) => x.structureType == STRUCTURE_SPAWN ||
                    x.structureType == STRUCTURE_EXTENSION ||
                    x.structureType == STRUCTURE_STORAGE ||
                    x.structureType == STRUCTURE_TOWER
            }
        )
        let push_list: PushList[] = []
        // for (let name of this.memory.creeps) {
        //     let creep = Game.creeps[name]
        //     if (creep.memory.role == ROLE_UPGRADER && creep.store.getFreeCapacity(RESOURCE_ENERGY) <= creep.store.getCapacity(RESOURCE_ENERGY) * 0.5) {
        //         push_list.push({ id: creep.id, priority: storage_priority.upgrader.priority })
        //     }
        // }
        /**最终加入内存的列表 */

        for (let i in list_receiver) {
            push_list.push({
                id: list_receiver[i].id,
                priority: energy_input_priority[list_receiver[i].structureType]
            })

            if (list_receiver[i].store[RESOURCE_ENERGY] < list_receiver[i].store.getCapacity(RESOURCE_ENERGY)) {
                if (!this.memory.list_energy_receiver) { this.memory.list_energy_receiver = [] }
                if (this.memory.list_energy_receiver.length == 0) {
                    this.memory.list_energy_receiver.push(push_list[i])
                    continue
                }
                let tempArr = []
                for (let j in this.memory.list_energy_receiver) {

                    tempArr[j] = this.memory.list_energy_receiver[j].id
                }
                if (!my_some(tempArr, list_receiver[i].id)) {

                    this.memory.list_energy_receiver.push(push_list[i])
                }
            }
        }
        //检查已经保存的需要能量的建筑，若满了则移除
        for (let i in this.memory.list_energy_receiver) {
            if (this.memory.list_energy_receiver[i].id != null) {
                if (Game.getObjectById(this.memory.list_energy_receiver[i].id as Id<StructureExtension>).store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                    this.memory.list_energy_receiver.splice(i as unknown as number, 1)
                }
            }
        }
        /**如果container为0，将能量从spawn移到ext中，将spawn从需求能量的列表中忽略 */

        for (let i in this.memory.list_energy_receiver) {
            let tar: Structure = Game.getObjectById(this.memory.list_energy_receiver[i].id) as Structure
            if (tar.structureType == STRUCTURE_SPAWN) {
                for (let j in this.memory.list_container_avail) {
                    if (this.memory.list_container_avail[j].id == tar.id) {
                        this.memory.list_energy_receiver.splice(i as unknown as number, 1)
                    }
                }
            }
        }

        this.memory.list_energy_receiver.sort((a, b) => a.priority - b.priority)

        //分配任务
        for (let name in this.memory.creeps) {
            if (Game.creeps[this.memory.creeps[name]]) {
                let creep = Game.creeps[this.memory.creeps[name]]
                if (!this.memory.list_energy_receiver) {
                    this.memory.list_energy_receiver = []
                }
                if (creep.memory.role == ROLE_CARRIER) {

                    switch (creep.memory.stats) {
                        case RETURNING:
                            creep.withdraw_from(this.memory.list_container_avail[0].id)
                            break;
                        case WORKING:
                            if (this.memory.list_energy_receiver[0]) {
                                if (this.memory.list_energy_receiver[0].id == this.memory.list_container_avail[0].id) {
                                    break
                                }
                                creep.give_to(this.memory.list_energy_receiver[0].id)
                            }
                            break;

                    }
                }
            }
        }
    },
    repair_job_distributer(this: Room) {
        let list_structure = this.find(FIND_STRUCTURES)
        for (let i in list_structure) {
            //查找所有生命值不满的建筑，存入内存中(不包括wall和rampart)
            if (list_structure[i].hits < list_structure[i].hitsMax * 0.8 &&
                list_structure[i].structureType != STRUCTURE_WALL &&
                list_structure[i].structureType != STRUCTURE_RAMPART) {
                if (!this.memory.list_repair) { this.memory.list_repair = [] }
                if (this.memory.list_repair.length == 0) {
                    this.memory.list_repair.push(list_structure[i].id)
                    continue
                }
                if (!my_some(this.memory.list_repair, list_structure[i].id)) {
                    this.memory.list_repair.push(list_structure[i].id)
                }
            }
            if (list_structure[i].structureType == STRUCTURE_RAMPART &&
                list_structure[i].hits <= RAMPART_MAX_HIT) {
                if (!this.memory.list_repair) { this.memory.list_repair = [] }
                if (this.memory.list_repair.length == 0) {
                    this.memory.list_repair.push(list_structure[i].id)
                    continue
                }
                if (!my_some(this.memory.list_repair, list_structure[i].id)) {
                    this.memory.list_repair.push(list_structure[i].id)
                }
            }
        }
        //检查内存中已经保存的建筑，若生命值已满则移除。对于wall和rampart而言，只需修道一个设定好的数字
        if (!this.memory.list_repair) { this.memory.list_repair = [] }
        for (let i in this.memory.list_repair) {
            if (!Game.getObjectById(this.memory.list_repair[i])) {
                this.memory.list_repair.splice(i as unknown as number, 1)
                continue
            }
            let tar = Game.getObjectById(this.memory.list_repair[i])

            if (tar.structureType == STRUCTURE_RAMPART &&
                tar.hits >= RAMPART_MAX_HIT) {
                this.memory.list_repair.splice(i as unknown as number, 1)
            }
            else if (tar.structureType != STRUCTURE_WALL &&
                tar.hits == tar.hitsMax) {
                this.memory.list_repair.splice(i as unknown as number, 1)
            }

        }

        //分配工作
        for (let name in this.memory.creeps) {
            let spawn: StructureSpawn[] = this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } })
            if (Game.creeps[this.memory.creeps[name]]) {
                let creep = Game.creeps[this.memory.creeps[name]]
                if (creep.memory.role == ROLE_REPAIRER) {

                    switch (creep.memory.stats) {
                        case RETURNING:
                            creep.withdraw_from(spawn[0].id)
                            break;
                        case WORKING:
                            creep.i_repair(this.memory.list_repair[0])
                            break;

                    }
                }
            }
        }
    },
    /**根据房间已经有的creep数量以及还缺少的数量进行下单
     * 下单信息应该包含
     * {role:
     *
     * }
     */
    order_creep(this: Room) {
        let cnt = 0
        for (let i in this.memory.list_source) {
            for (let j in this.memory.list_source[i].list_harvest_pos) {
                cnt += 1
            }
        }
        creepConfig[MIB_CFG].max_count = cnt - 2
        /**存活的creep数量 */
        let alive_list = {
            builder: 0,
            MIB: 0,
            harvester: 0,
            repairer: 0,
            upgrader: 0,
            carrier: 0
        }
        for (let i in this.memory.creep_count) {
            alive_list[i] = this.memory.creep_count[i]
        }
        let spawns: StructureSpawn[] = this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } })
        /**存活的+待孵化的creep数量 */
        let total_list = alive_list
        /**待孵化的creep数量*/

        if (!this.memory.list_spawn_order) { this.memory.list_spawn_order = [] }
        let order_list = this.memory.list_spawn_order
        if (order_list.length >= 0) {
            for (let role in alive_list) {
                //将已经下单的creep数量加上
                for (let i in order_list) {
                    if (order_list[i].role == role) {
                        total_list[role] += 1
                    }
                }
                //添加正在孵化的creep数量
                for (let spawn in spawns) {
                    if (spawns[spawn].memory.role == role) {
                        total_list[role] += 1

                    }
                }

            }
        }

        /**判断是生产MIB还是生产harvester */
        switch (this.decide_MIB_harvester()) {
            case false:
                //只生产mib
                total_list.harvester = 1000
                break;
            case true:
                total_list.MIB = 1000
                break;
        }
        /**判断是否生成builder */
        if (!this.memory.list_construction || this.memory.list_construction.length == 0) {
            total_list.builder = 1000
        }
        /**判断是否生成repairer */
        if (!this.memory.list_repair || this.memory.list_repair.length == 0) {

            total_list.repairer = 1000
        }
        /**判断是否生成carrier */

        if (this.decide_carrier() == false) {
            total_list.carrier = 1000
        }
        for (let i in total_list) {
            let name = creepCfgMap[i]
            if (total_list[i] < creepConfig[name].max_count) {
                for (let n = total_list[i]; n < creepConfig[name].max_count; n++) {
                    let order = { role: creepConfig[name].role, priority: creepConfig[name].priority }
                    this.memory.list_spawn_order.push(order)
                    /**每种职业一次只添加一个，避免一次性刷一大堆 */
                    break
                }
            }
        }
        //按优先级对订单列表进行排序
        this.memory.list_spawn_order.sort((a, b) => a.priority - b.priority)


        /**为避免能量不够产harvester导致订单列表卡住，加入判断 */
        if (this.energyAvailable <= 300 && this.memory.creep_count.carrier == 0) {
            for (let i = 0; i < this.memory.list_spawn_order.length; i++) {
                if (this.memory.list_spawn_order[i].role == 'harvester') {
                    this.memory.list_spawn_order.splice(i, 1)
                }
            }
        }
    },
    /**决定生产MIB或是harvester
     * 生产harvester的必要条件：每个source都有配套的container；
    */
    decide_MIB_harvester(this: Room) {
        if (this.energyAvailable < 550 && this.memory.creep_count.harvester == 0) {
            return false
        }
        /**遍历每个source是否都有配套的container，若都有，返回true，若非都有，返回false */
        if (this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } }).length == 0) {
            return false
        }
        if (this.memory.creep_count.carrier == 0) {
            return false
        }
        return true
    },

    /**
    没有收货对象则不孵化creep
    */
    decide_carrier(this: Room) {
        if (!this.memory.list_energy_receiver) { this.memory.list_energy_receiver = [] }
        if (this.memory.list_energy_receiver.length == 0) {

            return false

        }

        return true
    }

}
