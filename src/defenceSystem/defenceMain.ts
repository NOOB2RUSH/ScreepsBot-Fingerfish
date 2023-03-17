/**房间防御系统的入口 */
export function roomDefence(room: Room) {
    /**每10tick扫描一次 */
    if (Game.time % 10 == 0) {
        delete room.memory.hostileCreeps
        room.memory.hostileCreeps = []
        scan(room)
    }


}
/**扫描房间内的所有敌人，记录每个敌方creep的id、结构 */
export function scan(room: Room) {
    /**搜索房间内所有非我方creep，加入内存 */
    let hostileCreeps = room.find(FIND_HOSTILE_CREEPS)
    if (hostileCreeps.length > 0) {
        for (let creep of hostileCreeps) {
            let info = {
                id: creep.id,
                body: creep.body,
                level: measureLevel(creep.body)
            }
            room.memory.hostileCreeps.push(info)
        }
        /**按照威胁值排序 */
        room.memory.hostileCreeps.sort((a, b) => b.level - a.level)
    }
}
/**每种bodypart对应的威胁值 */
const bodyPartLevel = {
    attack: 10,
    ranged_attack: 5,
    heal: 20,
    work: 0,
    move: 1,
    carry: 1,
    claim: 50,
    tough: -1,
}


/**由一个creep的身体结构来计算其威胁等级 */
export function measureLevel(body: any): number {
    let level = 0
    for (let part of body) {
        level += bodyPartLevel[part.type]
    }
    console.log(`威胁等级${level}`);
    return level
}
