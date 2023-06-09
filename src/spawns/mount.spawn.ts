
import { RETURNING } from "creeps/creepConfiguration"
import { min } from "lodash"



/**将creep结构分为三种类型
 * [WORK,CARRY,MOVE]的比例
*/
const creepBodyModule = {
    MIB: [1, 2, 2],
    harvester: [5, 0, 1],
    carrier: [0, 1, 1],
    upgrader: [1, 2, 1],
    builder: [1, 2, 1],
    repairer: [1, 2, 1],
    scout: [0, 0, 1]
}

export function mount_spawn() {
    _.assign(StructureSpawn.prototype, spawnExtention)
}
export const spawnExtention = {

    /**按照内存中的顺序，抽取第一个creep订单进行执行 */
    spawn_by_order(this: StructureSpawn) {
        //检查是否可以生成creep
        if (this.spawnCreep([MOVE], 'testCreep', { dryRun: true }) == OK) {
            this.memory.role = 'idle'
            if (this.room.memory.list_spawn_order.length > 0) {
                var creepInfo = this.room.memory.list_spawn_order[0]
                let body = this.generate_body(creepInfo.role)
                let name = creepInfo.role + Game.time
                let mem = {}
                /**若为scout */
                if (creepInfo.role == 'scout') {
                    body = [MOVE]
                    mem = {
                        role: 'role_' + creepInfo.role,
                        stats: RETURNING,
                        scout_target: creepInfo.opts.scoutTarget
                    }
                    for (let baseName in Memory.baseList) {
                        for (let mineshaftName in Memory.baseList[baseName].linkedMineshaft) {
                            if (Memory.baseList[baseName].linkedMineshaft[mineshaftName].name === creepInfo.opts.scoutTarget) {
                                Memory.baseList[baseName].linkedMineshaft[mineshaftName].scoutName = name
                                break
                            }
                        }
                    }
                }
                else {
                    mem = {
                        role: 'role_' + creepInfo.role,
                        stats: RETURNING,
                    }
                }
                if (this.spawnCreep(body, name, {
                    memory: mem as CreepMemory,
                }) == OK) {
                    this.room.memory.list_spawn_order.splice(0, 1)
                    this.memory.role = creepInfo.role
                }
            }
        }
    },
    /**自动生成当前能量可以生成的最大体型creep */
    generate_body(this: StructureSpawn, role: string) {
        /**房间可用能量 */
        let max_cost = this.room.energyAvailable
        if (max_cost > 1000) { max_cost = 1000 }
        /**储存设定好的身体结构+ */
        let body: BodyPartConstant[] = []
        /**不同职能的creep具备不同的身体比例 */
        if (!creepBodyModule[role]) {
            return []
        }
        let module: number[] = creepBodyModule[role]
        let n = Math.floor(max_cost / (100 * module[0] + 50 * module[1] + 50 * module[2]))
        let max_work_parts = module[0] * n
        let max_carry_parts = module[1] * n
        let max_move_parts = module[2] * n
        for (let i = 0; i < max_work_parts; i++) {
            body.push(WORK)
        }
        for (let i = 0; i < max_carry_parts; i++) {
            body.push(CARRY)
        }
        for (let i = 0; i < max_move_parts; i++) {
            body.push(MOVE)
        }
        return body
    }
}


