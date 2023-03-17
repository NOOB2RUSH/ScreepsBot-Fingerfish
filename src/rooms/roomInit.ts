import { creepConfig, MIB_CFG } from "creeps/creepConfiguration"



/**对每个新房间进行初始化*/
export function room_Init(room: Room): number {

    if (room.memory.is_inited != true) {
        /*该房间未初始化：
        1、分配房间类型：基地/外矿/行军通道等
        2、储存房间内所有资源（source、矿）（暂时只储存source）
        3、若房间为respawn后第一个房间，则初始化Memory内容
        */
        room.memory.is_inited = true
        //分配房间类型，暂时只分配base
        room.memory.room_type = "base"
        room.memory.list_construction = []
        if (room.memory.room_type == "base") {
            //寻找所有source，检查可用采集点
            console.log('正在寻找采集点')
            room.memory.list_source = new Array<SourceInfo>()
            for (let i in room.find(FIND_SOURCES)) {
                room.memory.list_source[i] = {
                    id: null,
                    list_harvest_pos: null
                }
                room.memory.list_source[i].list_harvest_pos = new Array()
                room.memory.list_source[i].id = room.find(FIND_SOURCES)[i].id
                let pos_x = Game.getObjectById(room.memory.list_source[i].id).pos.x
                let pos_y = Game.getObjectById(room.memory.list_source[i].id).pos.y


                const terrain = new Room.Terrain(room.name)
                var check_list: XYPos[] = [
                    { x: pos_x - 1, y: pos_y - 1 },
                    { x: pos_x - 1, y: pos_y + 1 },
                    { x: pos_x - 1, y: pos_y },
                    { x: pos_x, y: pos_y - 1 },
                    { x: pos_x, y: pos_y + 1 },
                    { x: pos_x + 1, y: pos_y - 1 },
                    { x: pos_x + 1, y: pos_y + 1 },
                    { x: pos_x + 1, y: pos_y },

                ]
                //console.log(terrain.get(check_list[0].x, check_list[0].y))


                for (let j in check_list) {
                    //获取坐标位置地形\

                    switch (terrain.get(check_list[j].x, check_list[j].y)) {
                        case TERRAIN_MASK_WALL:

                            break;
                        //如果不是墙体，则将该位置加入可用的点位列表
                        case TERRAIN_MASK_SWAMP:
                            var temp: Harvest_pos = {
                                pos: new RoomPosition(check_list[j].x, check_list[j].y, room.name),
                                link_source: room.memory.list_source[i].id,
                                occupied: false,
                                occupied_by: null,
                                has_container: false

                            }
                            room.memory.list_source[i].list_harvest_pos.push(temp)
                            break;
                        case 0:

                            var temp: Harvest_pos = {
                                pos: new RoomPosition(check_list[j].x, check_list[j].y, room.name),
                                link_source: room.memory.list_source[i].id,
                                occupied: false,
                                occupied_by: null,
                                has_container: false
                            }
                            room.memory.list_source[i].list_harvest_pos.push(temp)

                            break;
                    }
                }
                let cnt = 0;
                for (let i in room.memory.list_source) {
                    for (let j in room.memory.list_source[i].list_harvest_pos) {
                        cnt += 1
                    }
                }
                console.log('该source共找到可用点位' + cnt + '个')
            }
        }
        let cnt = 0;
        for (let i in room.memory.list_source) {
            for (let j in room.memory.list_source[i].list_harvest_pos) {
                cnt += 1
            }
        }
        console.log('source共找到可用点位' + cnt + '个')



        room.memory.creep_count = { MIB: 0, upgrader: 0, builder: 0, carrier: 0, repairer: 0, harvester: 0 }
        room.memory.creeps = []
        room.memory.list_repair = []
        room.memory.list_spawn_order = []
        room.memory.list_container_avail = []
        room.memory.list_energy_receiver = []
    }
    return 0
}



