import { memoize, result } from "lodash"
import { room_Init } from "rooms/roomInit"

/**在最高层面进行策略指定与管理 */
export const headQuarter = {
    /**'W23S21'
     * 从中央房间开始，寻找周围可作为外矿的房间
     * @param base 中央房间
     */
    findMineshaft: function (base: Room) {
        let pos: { x: number, y: number } = { x: 0, y: 0 }
        let strAt = 0
        for (let i = 1; i < base.name.length; i++) {
            if (base.name.charCodeAt(i) >= 65 && base.name.charCodeAt(i) <= 90) {
                pos.x = base.name.substring(1, i) as unknown as number
                pos.y = base.name.substring(i + 1) as unknown as number
                strAt = i
                break
            }
        }
        if (pos.x == 0) {
            return
        }
        if (pos.y == 0) {
            return
        }

        /**寻找周围相邻的四个房间 */
        let searchList = []
        searchList.push(base.name.charAt[0] + (pos.x - 1) + base.name.charAt[strAt] + (pos.y))
        searchList.push(base.name.charAt[0] + (pos.x) + base.name.charAt[strAt] + (pos.y - 1))
        searchList.push(base.name.charAt[0] + (pos.x + 1) + base.name.charAt[strAt] + (pos.y))
        searchList.push(base.name.charAt[0] + (pos.x) + base.name.charAt[strAt] + (pos.y + 1))
        let completePathList = []
        for (let name of searchList) {
            if (Game.rooms[name].controller && !Game.rooms[name].memory.is_inited) {
                let origin = new RoomPosition(base.memory.city_central[0], base.memory.city_central[1], base.name)
                let goal = new RoomPosition(24, 24, name)
                /**尝试寻路 */
                let findResult = PathFinder.search(origin, goal, {
                    maxRooms: 2
                })
                if (findResult.incomplete == false) {
                    completePathList.push(findResult)
                    room_Init(Game.rooms[name], 'mineshaft', base.name)
                }
            }
        }
        if (completePathList.length > 0) {
            /**按照移动成本从小到大排列 */
            completePathList.sort((a, b) => a.cost - b.cost)
            for (let path of completePathList) {

            }
        }

    }
}
