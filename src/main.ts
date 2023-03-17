
import { mount_ext } from "mount";
import { runCreepEveryTick } from "creeps/runCreepEveryTick";
import { ErrorMapper } from "utils/ErrorMapper";
import { memoryUnleasher } from "utils/memoryUnleash";
import { room_Init } from "rooms/roomInit";
import { auto_place_site, best_anchor, find_square, generate_room_cost_map, room_cost_map, single_cost } from "autoPlanner/autoPlanner";
import { roomDefence } from "defenceSystem/defenceMain";





//全局重置时加载的代码
mount_ext()


// for (let name in Game.rooms) {
//   let room = Game.rooms[name]
//   let terrain = room.getTerrain()
//   room.memory.city_central = best_anchor(generate_room_cost_map(room), find_square(terrain, 13))

// }


export const loop = ErrorMapper.wrapLoop(() => {
  //   if(Game.cpu.bucket == 10000) {
  //     Game.cpu.generatePixel();
  // }

  memoryUnleasher()

  //入口
  for (var n in Game.rooms) {
    let room = Game.rooms[n]
    room_Init(room)
    room.find_creep()
    room.order_creep()
    let spawns = room.find(FIND_MY_SPAWNS)
    for (let i in spawns) {
      spawns[i].spawn_by_order()
    }
    //每10tick进行一次自动建筑规划以及建筑工地搜索
    if (Game.time % 10 == 0) {
      room.construct_job_finder()
    }
    if (Game.time % 1000 == 0) {
      auto_place_site(room)
    }
    /**工作发布 */
    room.carry_job_distributer()
    room.construct_job_giver()
    room.repair_job_distributer()

    /**防卫 */
    roomDefence(room)
    let towers: StructureTower[] = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } })
    for (let tower of towers) {
      tower.run()
    }
  }
  //spawnController(Game.spawns['Spawn1'])
  runCreepEveryTick()


});
