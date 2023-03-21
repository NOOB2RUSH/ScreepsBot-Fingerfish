

interface Memory {
    /**保存所有作为base的房间 */
    baseList: baseList
    /**需要开视野的房间名数组 */
    fogRooms: string[]
}
/**检索：base房间名：所拥有的外矿房间名 */
interface baseList {
    [baseName: string]: {
        linkedMineshaft: {
            name: string,
            hasScout: boolean,
            scoutName?: string,
        }[]
    }
}


interface SpawnMemory {
    /**当前正在孵化的creep种类 */
    role: string,
}

interface StructureSpawn {
    generate_body(this: StructureSpawn, role: string): BodyPartConstant[],
    spawn_by_order(this: StructureSpawn): void
}

interface StructureTower {
    /**tower入口函数 */
    run(): void
    autoAttack(): void
    i_repair(): void
}
interface Creep {
    i_carry(room: Room): void
    i_repair(target: Id<Structure>)

    say_hello(): void
    withdraw_from(giver: Id<Structure>): void
    my_build(construction_site: Id<ConstructionSite>): void
    give_to(receiver: Id<Structure | Creep>): void
    i_harvest(): void
}

interface Room {
    /**根据房间已经有的creep数量以及还缺少的数量进行下单
     * 下单信息应该包含
     * {role:
     *
     * }
     */
    order_creep(): void
    find_creep(): void
    plan_container(): void
    construct_job_finder(): void
    construct_job_giver(): void
    energy_storage_finder(): void
    carry_job_distributer(): void
    repair_job_distributer(): void
    decide_MIB_harvester(): boolean
    decide_carrier(): boolean
}
/**
 房间内存
*/
interface RoomMemory {
    hostileCreeps: {
        id: Id<Creep>,
        body: Array<any>,
        level: number
    }[]
    city_central: number[]
    list_spawn_order: {
        /**格式类似 'builder' */
        role: string
        priority: number
        opts?: {
            scoutTarget: string
        }
    }[]
    creep_count: {
        builder: number
        MIB: number
        harvester: number
        upgrader: number
        carrier: number
        repairer: number
    }
    creeps: string[]
    is_inited: boolean
    /**包含房间内所有source的列表*/
    list_source: SourceInfo[]
    room_type: string//房间类型
    /**包含房间内所有建筑工地的列表 */
    list_construction: { id: Id<ConstructionSite>, priority: number }[]
    /**存储着所有可能提供能量的对象（此处指container）*/
    list_container_avail: { id: Id<StructureContainer | StructureSpawn | StructureStorage>, priority: number }[]
    //存储所有可能需要能量的对象
    list_energy_receiver: {
        id: Id<Structure | Creep>,
        priority: number
    }[]
    /**储存所有需要维修的对象 */
    list_repair: Id<Structure>[]
    /**储存所有tower */
    list_tower: Id<StructureTower>

    list_energy_available
}

interface PushList {
    id: Id<Structure | Creep>,
    priority: number
}
/**source信息
 * 包括source的id\采集点信息
 */
interface SourceInfo {
    id: Id<Source>
    list_harvest_pos: Harvest_pos[]
}
/**{
 * x:number,
 * y:number
 * } */
interface XYPos {
    x: number
    y: number
}
/**每个source周边可供采集的点位
 * 包含位置、相邻source、是否已经分配以及分配对象
 */
interface Harvest_pos {
    pos: RoomPosition;//位置
    link_source: Id<Source>;//所属于的source
    occupied: boolean;//是否已经被分配
    occupied_by: string
    has_container: boolean//是否已经建成container
}

interface CreepMemory {
    role: string;
    stats: string;
    harvest_pos?: Harvest_pos
    /**carrier专属，记载当前任务目标 */
    carry_target?: Id<Structure | Creep>
    /**carrier专属，记载当前任务类型（transfer/withdraw） */
    carry_type?: string
    /**scout专属，记载侦察目的房间名 */
    scout_target?: string
}


// interface CarrierCreepMemory extends CreepMemory {
//     withdraw_from: Id<StructureContainer>
//     deliver_to: Id<StructureSpawn | StructureExtension | StructureStorage | Creep>
// }



interface creepCfgMap {
    [role: string]: number
}

interface roleInfoCard {
    role: string
    body_parts: { 1: [BodyPartConstant, number][] }
    max_count: number
    priority: number
}

/**储存建筑列表 */
declare const list_storage: Structure[]











