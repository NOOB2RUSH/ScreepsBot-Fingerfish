import { role_scout } from "creeps/roleFunctions"
import { flatten, min } from "lodash"
import { basename } from "path"
import { room_Init } from "rooms/roomInit"


/**在最高层面进行策略指定与管理 */
export const headQuarter = {
    /**'W23S21'
     * 从中央房间开始，寻找周围可作为外矿的房间
     * 找到后，向base房间下scout订单，派遣scout去相邻房间侦察
     * @param base 中央房间
     */
    findMineshaft: function (base: Room) {
        if (!Memory.baseList[base.name].linkedMineshaft) {
            Memory.baseList[base.name].linkedMineshaft = []
        }
        if (Memory.baseList[base.name].linkedMineshaft.length != 0) {
            return
        }
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
        searchList.push(base.name.charAt(0) + (pos.x - 1) + base.name.charAt(strAt) + (pos.y))
        searchList.push(base.name.charAt(0) + (pos.x) + base.name.charAt(strAt) + (pos.y - 1))
        searchList.push(base.name.charAt(0) + (pos.x + 1) + base.name.charAt(strAt) + (pos.y))
        searchList.push(base.name.charAt(0) + (pos.x) + base.name.charAt(strAt) + (pos.y + 1))
        for (let name of searchList) {
            /**1、确认有可到达目标房间的路径 */
            let origin = new RoomPosition(base.memory.city_central[0], base.memory.city_central[1], base.name)
            let goal = new RoomPosition(24, 24, name)
            /**尝试寻路 */
            let findResult = PathFinder.search(origin, { pos: goal, range: 23 }, {
                maxRooms: 2,
            })
            /**找到完整路径 */
            if (findResult.incomplete == false) {
                //将房间名加入base下属的mineshaft数组中
                if (!Memory.baseList[base.name].linkedMineshaft.some(ele => ele.name === name)) {
                    Memory.baseList[base.name].linkedMineshaft.push({ name: name, hasScout: false })
                }
            }
        }
        if (Memory.baseList[base.name].linkedMineshaft.length == 0) {
            Memory.baseList[base.name].linkedMineshaft.push({ name: 'No Mineshaft', hasScout: false })
        }
    },
    /**向玩家发出警告，自动激活安全模式 */
    earlyWarning: function () {
        for (let name in Game.rooms) {
            if (Game.rooms[name].memory.hostileCreeps && Game.rooms[name].memory.hostileCreeps.length > 0) {
                if (!Game.getObjectById(Game.rooms[name].memory.hostileCreeps[0].id)) {
                    Game.rooms[name].memory.hostileCreeps.splice(0, 1)
                }
                if (Game.getObjectById(Game.rooms[name].memory.hostileCreeps[0].id).owner.username != 'Invader') {
                    let code = Game.rooms[name].controller.activateSafeMode()
                    Game.notify(name + 'is under attack' + 'safe mode attempt:' + code)
                }
            }
        }
    },

    /**scout指挥中心
     * 遍历base下属所有的mineshaft，若发现有房间没有视野，则孵化scout并派遣
     */
    scoutCommander: function () {
        for (let baseName in Memory.baseList) {
            if (!Memory.baseList[baseName].linkedMineshaft) {
                return
            }
            if (Memory.baseList[baseName].linkedMineshaft.length == 0) {
                return
            }

            for (let mineshaftName in Memory.baseList[baseName].linkedMineshaft) {
                /**外矿房间 */
                let mineshaft = Game.rooms[Memory.baseList[baseName].linkedMineshaft[mineshaftName].name]
                /**对有视野的房间进行初始化 */
                if (mineshaft && !mineshaft.memory.is_inited) {
                    room_Init(mineshaft, 'mineshaft', baseName)
                }


                /**对没视野的房间派遣scout */
                if (!mineshaft &&
                    Memory.baseList[baseName].linkedMineshaft[mineshaftName].hasScout === false) {
                    //向base房间推送孵化订单
                    Game.rooms[baseName].memory.list_spawn_order.push({
                        role: 'scout',
                        priority: 10,
                        opts: {
                            scoutTarget: Memory.baseList[baseName].linkedMineshaft[mineshaftName].name
                        }
                    })
                    Memory.baseList[baseName].linkedMineshaft[mineshaftName].hasScout = true
                }
                else if (!Game.creeps[Memory.baseList[baseName].linkedMineshaft[mineshaftName].scoutName]
                ) {
                    let temp: boolean = true
                    temp = !Game.rooms[baseName].memory.list_spawn_order.some(ele => ele.role == 'scout')


                    if (temp) {
                        delete Memory.baseList[baseName].linkedMineshaft[mineshaftName].scoutName
                        Memory.baseList[baseName].linkedMineshaft[mineshaftName].hasScout = false
                    }
                }


            }
        }
    },

    /**
     * 建造从base通向mineshaft的道路
     * @param origin 起点(base房间)
     * @param goal 终点(mineshaft房间)
     */
    buildRoadToMineshaft: function (origin: RoomPosition, goal: RoomPosition) {

    },
    /**
     * 外矿房间运营的入口函数，包括功能：下单harvester
     * @param mineshaft 需要运行的外矿房间
     * @param linkedBase 该外矿所连接的base房间
     */
    mineshaftController: function (mineshaft: Room, linkedBase: Room) {
        /**harvester相关 */
        for (let i in mineshaft.memory.list_source) {
            /**找到未被分配的source，向base发出订单 */
            if (!mineshaft.memory.list_source[i].list_harvest_pos[0].occupied) {
                linkedBase.memory.list_spawn_order.push({
                    role: 'mineshaftHarvester',
                    priority: 11,
                })
                mineshaft.memory.list_source[i].list_harvest_pos[0].occupied = true
                mineshaft.memory.list_source[i].list_harvest_pos[0].occupied_by = 'temp'
            }
            /**对已经分配的source，访问其对应的harvester，若不存在，则清空 */
            else if (mineshaft.memory.list_source[i].list_harvest_pos[0].occupied === true &&
                mineshaft.memory.list_source[i].list_harvest_pos[0].occupied_by != 'temp' &&
                !Game.creeps[mineshaft.memory.list_source[i].list_harvest_pos[0].occupied_by]) {
                mineshaft.memory.list_source[i].list_harvest_pos[0].occupied = false
                mineshaft.memory.list_source[i].list_harvest_pos[0].occupied_by = null
            }
        }

        /**建筑相关 */
    }

}
