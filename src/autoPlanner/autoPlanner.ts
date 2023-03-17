
import { layoutCFG } from "./layoutCfg"




export function single_cost(source_pos: XYPos, terrain: RoomTerrain) {
    let visit_list: {
        pos: XYPos,
        dist: number
    }[] = [{ pos: source_pos, dist: 0 }]
    let known_list: {
        pos: XYPos,
        dist: number
    }[] = [{ pos: source_pos, dist: 0 }]
    for (let pos of visit_list) {
        // console.log(`${pos.pos.x}_${pos.pos.y}`);
        let adjoint_pos_list: XYPos[] = [
            { x: pos.pos.x - 1, y: pos.pos.y - 1 },
            { x: pos.pos.x - 1, y: pos.pos.y + 1 },
            { x: pos.pos.x - 1, y: pos.pos.y },
            { x: pos.pos.x + 1, y: pos.pos.y - 1 },
            { x: pos.pos.x + 1, y: pos.pos.y + 1 },
            { x: pos.pos.x + 1, y: pos.pos.y },
            { x: pos.pos.x, y: pos.pos.y - 1 },
            { x: pos.pos.x, y: pos.pos.y + 1 },]
        for (let adjoint_pos of adjoint_pos_list) {
            //若发现墙点或该点已经在列表内，则不访问
            if (terrain.get(adjoint_pos.x, adjoint_pos.y) == TERRAIN_MASK_WALL ||
                adjoint_pos.x < 0 || adjoint_pos.y < 0 ||
                adjoint_pos.x > 49 || adjoint_pos.y > 49) {
                continue
            }
            let has: boolean = false
            for (let temp of known_list) {
                if (temp.pos.x == adjoint_pos.x && temp.pos.y == adjoint_pos.y) {
                    has = true
                }
            }
            if (has) {
                continue
            }
            let p: {
                pos: XYPos,
                dist: number
            } = { pos: { x: adjoint_pos.x, y: adjoint_pos.y }, dist: pos.dist + 1 }
            known_list.push(p)
            visit_list.push(p)
            //console.log(`${adjoint_pos.x}_${adjoint_pos.y}`);
        }
    }
    return known_list
}


export function room_cost_map(source_list: XYPos[], terrain: RoomTerrain) {

    let total_cost_map: number[][] = new Array<Array<number>>


    for (let i = 0; i < 50; i++) {
        total_cost_map[i] = []
        for (let j = 0; j < 50; j++) {
            total_cost_map[i].push(-1)
        }
    }



    for (let source of source_list) {
        let cost_map = single_cost(source, terrain)

        for (let pos of cost_map) {
            //此处可按照权重
            total_cost_map[pos.pos.x][pos.pos.y]
                += pos.dist
        }
    }
    return total_cost_map
}


export function generate_room_cost_map(room: Room) {

    let list = new Array<XYPos>
    let sources = room.find(FIND_SOURCES)
    let controller = room.controller
    let mineral = room.find(FIND_MINERALS)
    for (let i in sources) {
        list.push({ x: sources[i].pos.x, y: sources[i].pos.y })
    }
    list.push({ x: controller.pos.x, y: controller.pos.y })
    list.push({ x: mineral[0].pos.x, y: mineral[0].pos.y })

    let result = room_cost_map(list, room.getTerrain())
    return result
}



export function find_square(terrain: RoomTerrain, threshold: number) {
    let buffer: number[][] = [[]];   // 数组中的数字代表以这个点为右下角的最大空地正方形的边长
    for (let i = 0; i < 50; i++) {
        buffer[i] = []
        for (let j = 0; j < 50; j++) {
            buffer[i].push(0)
        }
    }


    let anchors = [];   // 用于记录所有足够大的正方形的右下角坐标

    // 初始化 x=0 和 y=0 两条边
    for (let y = 2; y < 48; y++) {    // x = 2
        if (!(terrain.get(2, y) & TERRAIN_MASK_WALL)) {     // 如果是空地
            buffer[2][y] = 1;   // 有边长为1的正方形空地
        }
    }
    for (let x = 2; x < 48; x++) {    // y = 2
        if (!(terrain.get(x, 2) & TERRAIN_MASK_WALL)) {     // 如果是空地
            buffer[x][2] = 1;   // 有边长为1的正方形空地
        }
    }

    // 动态规划遍历所有点
    for (let x = 3; x < 48; x++) {
        for (let y = 3; y < 48; y++) {
            if (!(terrain.get(x, y) & TERRAIN_MASK_WALL)) {     // 如果是空地
                buffer[x][y] = 1 + min(buffer[x - 1][y - 1], buffer[x - 1][y], buffer[x][y - 1]);   // 递推公式
                if (buffer[x][y] > threshold) {     // 大于阈值
                    anchors.push([x - 6, y - 6]);   // 记录坐标
                }
            } // else buffer[x][y] = 0 即初始值
        }
    }

    return anchors; // 返回所有足够大的正方形中心坐标


}
export function best_anchor(map: number[][], anchors: any[]) {
    let best_anchor = {
        pos: [0, 0],
        dist: 10000
    }
    for (let i in anchors) {
        if (map[anchors[i][0]][anchors[i][1]] < best_anchor.dist) {
            best_anchor.dist = map[anchors[i][0]][anchors[i][1]]
            best_anchor.pos = [anchors[i][0], anchors[i][1]]
        }
    }
    return best_anchor.pos
}
export function min(a: number, b: number, c: number) {
    if (a <= b) {
        if (a <= c) {
            return a
        }
        else {
            return c
        }
    }
    else {
        if (b >= c) {
            return c
        }
        else {
            return b
        }
    }
}
/**
 * 自动规划入口函数
 * @param room
 */
export function auto_place_site(room: Room) {
    plan_container(room)
    if (!room.memory.city_central) { room.memory.city_central = best_anchor(generate_room_cost_map(room), find_square(room.getTerrain(), 13)) }
    if (room.memory.city_central) {
        for (let site of layoutCFG) {
            room.createConstructionSite(site.pos.x - 24 + room.memory.city_central[0],
                site.pos.y - 36 + room.memory.city_central[1],
                site.type as unknown as BuildableStructureConstant)
        }
        checkRoad(room)
        checkRampart(room, 13)
    }
    else {
        console.log(`自动布局失败，未找到合适的中心位置`);
    }
}
/**为该房间自动规划建筑位置 */
export function plan_container(room: Room) {

    // if (this.controller.level < 3) {
    //     return
    // }

    /**检查房间内已有的所有建筑并储存 */
    /**检查container，返回包含当前房间所有container的数组 */
    //检查是否每个source都有一个container，默认放在采集点列表的第一个位置。
    for (let i in room.memory.list_source) {
        let source_info = room.memory.list_source[i]
        //该位置没有container，放置一个container工地

        if (!source_info.list_harvest_pos[0].has_container || source_info.list_harvest_pos[0].pos) {
            room.createConstructionSite(
                room.memory.list_source[i].list_harvest_pos[0].pos.x,
                room.memory.list_source[i].list_harvest_pos[0].pos.y,
                STRUCTURE_CONTAINER)
            room.memory.list_source[i].list_harvest_pos[0].has_container = true
            continue
        }
    }
}


function modifyCostMat(room: Room) {
    let cc = room.memory.city_central
    let mat: number[][] = []
    for (let site of layoutCFG) {
        //标记所有建筑位置
        if (site.type != 'road') { mat.push([site.pos.x - 24 + cc[0], site.pos.y - 36 + cc[1]]) }
    }
    let costMat = new PathFinder.CostMatrix
    for (let pos of mat) {
        costMat.set(pos[0], pos[1], 50)
    }
    return { costMat: costMat, mat: mat }
}


function checkRoad(room: Room) {
    let costMat = modifyCostMat(room).costMat
    let mat = modifyCostMat(room).mat
    /**资源点位置 */
    let list: number[][] = []
    let sources = room.find(FIND_SOURCES)
    let controller = room.controller
    let mineral = room.find(FIND_MINERALS)
    for (let i in sources) {
        list.push([sources[i].pos.x, sources[i].pos.y])
    }
    list.push([controller.pos.x, controller.pos.y])
    list.push([mineral[0].pos.x, mineral[0].pos.y])
    let cc = new RoomPosition(room.memory.city_central[0], room.memory.city_central[1], room.name)
    for (let tar of list) {

        let ret = PathFinder.search(
            cc,
            {
                pos: new RoomPosition(tar[0], tar[1], room.name),
                range: 2
            },
            {
                roomCallback: () => costMat,
                maxRooms: 1
            }
        )
        /**计算得到的路径是否跨越建筑 */
        let overLap = false
        for (let i of ret.path) {
            for (let j of mat)
                if (i.x == j[0] && i.y == j[1]) {
                    console.log(`无法生成到达${tar}的路径`);
                    overLap = true
                }
        }
        if (!overLap) {
            for (let i of ret.path) {
                room.createConstructionSite(i.x, i.y, STRUCTURE_ROAD)
            }
        }
    }
}
/**
 *
 * @param terrain 房间地形图
 * @param threshold 建筑集群边长
 * @param cc 建筑集群中心点[x,y]
 */
function checkRampart(room: Room, threshold: number) {
    threshold -= 1
    let cc = room.memory.city_central
    /**确定rampart的四个顶点 */
    let tl = [cc[0] - threshold / 2 - 4, cc[1] - threshold / 2 - 4]
    let tr = [cc[0] + threshold / 2 + 4, cc[1] - threshold / 2 - 4]
    let bl = [cc[0] - threshold / 2 - 4, cc[1] + threshold / 2 + 4]
    let br = [cc[0] + threshold / 2 + 4, cc[1] + threshold / 2 + 4]
    function drawLine(p1: number[], p2: number[]) {
        if (p1[0] === p2[0]) {
            let minY = Math.min(p1[1], p2[1])
            let maxY = Math.max(p1[1], p2[1])
            for (let y = minY; y <= maxY; y++) {
                room.createConstructionSite(p1[0], y, STRUCTURE_RAMPART)
            }
        }
        else if (p1[1] === p2[1]) {
            let minX = Math.min(p1[0], p2[0])
            let maxX = Math.max(p1[0], p2[0])
            for (let x = minX; x <= maxX; x++) {
                room.createConstructionSite(x, p1[1], STRUCTURE_RAMPART)
            }
        }
    }
    drawLine(tl, tr)
    drawLine(tl, bl)
    drawLine(tr, br)
    drawLine(bl, br)
}
