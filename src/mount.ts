import { mount_creep } from "creeps/mount.creep"
import { mount_room } from "rooms/mount.room"
import { mount_spawn } from "spawns/mount.spawn"
import { mount_tower } from "towers/mount.towers"

export function mount_ext() {
    console.log('[mount]重新挂载拓展')
    mount_creep()
    mount_room()
    mount_spawn()
    mount_tower()
}



