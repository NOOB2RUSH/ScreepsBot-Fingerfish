/**所有对creep做的原型拓展 */
import { RETURNING, ROLE_CARRIER, WITHDRAW, WORKING } from "creeps/creepConfiguration"
import { CreateOptions } from "mocha/lib/interfaces/common"


/**写入扩展的creep方法 */
export function mount_creep() {
    _.assign(Creep.prototype, creepExtention)
}


/**自定义的creep拓展 */
export const creepExtention = {
    /**
     * 命令某个creep从某建筑物中取得能量,执行后若储存能量已满，将creep状态设置为WORKING
     *
     * @param giver 该建筑物的id
     *      */
    withdraw_from(this: Creep, giver: Id<StructureContainer | StructureSpawn | StructureExtension | StructureStorage>) {
        // console.log(this.name);
        // console.log(giver);
        let target = Game.getObjectById(giver)
        if (!target) { return }
        if (this.store[RESOURCE_ENERGY] == this.store.getCapacity()) {
            this.memory.stats = WORKING
        }
        /**为避免upgrader builder把所有的能量都拿去建造，设置最小值 */
        if (this.memory.role != ROLE_CARRIER && target.store[RESOURCE_ENERGY] < 300) {
            return
        }
        if (this.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {

            this.moveTo(target.pos.x, target.pos.y,
                {
                    reusePath: 5, visualizePathStyle: {}
                })
        }
        //收集满了，去建筑
        else if (this.store[RESOURCE_ENERGY] == this.store.getCapacity()) {

            this.memory.stats = WORKING
        }
    },
    /**
     * 命令creep去建设某个工地.执行后若储存的能量为0，则将creep的状态设置为RETURNING
     * @param construction_site 工地id
     *
     */
    my_build(construction_site: Id<ConstructionSite>) {
        let target = Game.getObjectById(construction_site)
        if (this.build(target) == ERR_NOT_IN_RANGE) {
            this.moveTo(target.pos.x, target.pos.y,
                {
                    reusePath: 5, visualizePathStyle: {}
                })
        }
        //能量用完了就去收集
        else if (this.store[RESOURCE_ENERGY] == 0) {
            this.memory.stats = RETURNING
        }
    },
    /**
     * 命令creep向某个对象传输能量
     * @param receiver 接受能量的对象id
     */
    give_to(this: Creep, receiver: Id<StructureSpawn | StructureExtension | StructureStorage | Creep>) {
        let target = Game.getObjectById(receiver)
        if (this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(target.pos.x, target.pos.y,
                {
                    reusePath: 5, visualizePathStyle: {}
                })
        }
        //能量送完，去收集能量
        else if (this.store[RESOURCE_ENERGY] == 0) {
            this.memory.stats = RETURNING
        }
    },
    /**
     * 命令creep去某位置采集能量
     * @param harvest_pos creep指定的RoomPosition对象
     */
    i_harvest() {
        var harvest_pos = new RoomPosition(this.memory.harvest_pos.pos.x, this.memory.harvest_pos.pos.y, this.room.name)
        if (this.pos.x != harvest_pos.x || this.pos.y != harvest_pos.y) {
            this.moveTo(
                harvest_pos,
                { reusePath: 10, visualizePathStyle: {} })
        }
        else {
            this.harvest(Game.getObjectById(this.memory.harvest_pos.link_source))
        }
        /**存满了就转换为运送模式 */
        if (this.store[RESOURCE_ENERGY] == this.store.getCapacity()) {
            this.memory.stats = RETURNING
        }
    },
    i_repair(this: Creep, target: Id<Structure>) {
        if (this.repair(Game.getObjectById(target)) == ERR_NOT_IN_RANGE) {
            this.moveTo(
                Game.getObjectById(target).pos,
                { reusePath: 10, visualizePathStyle: {} }
            )
        }
        if (this.store[RESOURCE_ENERGY] == 0) {
            this.memory.stats = RETURNING
        }
    }
}

/**寻找有能量剩余的container并前往收集能量 */
Creep.prototype.i_carry = function (this: Creep) {


}
