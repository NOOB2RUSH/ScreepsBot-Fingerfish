
/**检查该数组内是否含有元素element，使用时请确保待检索数组内元素类型与目标元素类型相同
 * @param element 检索目标，若有返回true，若没有返回false
*/

import exp from "constants"

export function my_some(arr: Array<any>, element: any): boolean {
    for (let i in arr) {
        if (arr[i] === element) {
            return true
        }
    }
    return false
}


/**解包creepConfig内保存的bodyPart数据 */
export function body_resolve(parts: [BodyPartConstant, number][]): (BodyPartConstant[]) {
    let body: BodyPartConstant[] = []
    for (let a in parts) {
        for (let b = 0; b < parts[a][1]; b++) {
            body.push(parts[a][0])
        }
    }
    return body
}

/**计算两个坐标之间的直线距离 */
export function distance(a: [x: number, y: number], b: [x: number, y: number]) {

}
