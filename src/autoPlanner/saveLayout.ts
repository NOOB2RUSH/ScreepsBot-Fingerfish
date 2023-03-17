export function saveJSON(name: string) {
    let room = Game.rooms[name]
    let arr = room.find(FIND_STRUCTURES)
    let saveArr: {
        type: string
        id: Id<AnyStructure>
        pos: {
            x: number,
            y: number
        }
    }[] = []
    for (let i in arr) {
        let obj = {
            type: arr[i].structureType,
            id: arr[i].id,
            pos: {
                x: arr[i].pos.x,
                y: arr[i].pos.y
            }
        }
        saveArr.push(obj)
    }
    console.log(JSON.stringify(saveArr));
}
