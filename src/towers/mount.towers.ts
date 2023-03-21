import { isAbsolute } from "path"

export function mount_tower() {
    _.assign(StructureTower.prototype, towerExtention)
}
export const towerExtention = {
    /**tower运行函数入口 */
    run(this: StructureTower) {
        if (this.room.memory.hostileCreeps.length > 0) {
            this.autoAttack()
        }
        else {
            this.i_repair()
        }
    },




    /**自动维修，只维修市中心（15*15) */
    i_repair(this: StructureTower) {
        for (let tar of this.room.memory.list_repair) {
            if (Game.getObjectById(tar).pos) {
                if (Math.abs(Game.getObjectById(tar).pos.x - this.pos.x) > 15 || Math.abs(Game.getObjectById(tar).pos.y - this.pos.y) > 15) {
                    continue
                }
                this.repair(Game.getObjectById(tar))
            }
        }
    },

    /**自动攻击hostileCreeps中的第一个
     */
    autoAttack(this: StructureTower) {
        if (!this.room.memory.hostileCreeps) {
            return
        }
        if (this.room.memory.hostileCreeps.length > 0) {
            if (!Game.getObjectById(this.room.memory.hostileCreeps[0].id)) {
                this.room.memory.hostileCreeps.splice(0, 1)
                return
            }
            let tar = Game.getObjectById(this.room.memory.hostileCreeps[0].id)
            if (tar) {
                this.attack(tar)
            }
        }
    }
}
