//根据房间情况判断‘时代’，采取不同的creep孵化策略和不同的建筑学
/**1阶段，只生成MIB和upgrader */
const PRIMITIVE_AGE = 500

/**2阶段，正常生成MIB，upgrader、builder、repairer主要任务：建设2个container和5个ext */
const STONE_AGE = 501

/**3阶段，生成harvester，carrier,repairer,builder,upgrader, 建设5个ext 1个tower */
const MEDIEVAL_AGE = 502

/**4阶段， -- ，建设10个ext 1个storage */
const RENAISSANCE_AGE = 503



export const age_config = {
    PRIMITIVE_AGE: {
        struc_list: {
            extensions: 0,
            containers: 2,


        }
    },
    STONE_AGE: {},
    MEDIEVAL_AGE: {},
    RENAISSANCE_AGE: {},
}


/**根据房间现状判断所处的时代
 * 时代进步每次最多进步一级
 */
export function age_assessment(room: Room) {
    let current_age = room.memory.current_age

}
