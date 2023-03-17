
//防止打错字
export const ROLE_MIB = 'role_MIB'
export const ROLE_UPGRADER = 'role_upgrader'
export const ROLE_HARVESTER = 'role_harvester'
export const ROLE_CARRIER = 'role_carrier'
export const ROLE_BUILDER = 'role_builder'
export const ROLE_REPAIRER = 'role_repairer'

export const WITHDRAW = 'withdraw'
export const TRANSFER = 'transfer'




export const IDLE = 'idle'
export const WORKING = 'working'
export const RETURNING = 'returning'


export const MIB_CFG = 0
export const HARVESTER_CFG = 1
export const UPGRADER_CFG = 2
export const CARRIER_CFG = 3
export const BUILDER_CFG = 4
export const REPAIRER_CFG = 5

export const ENERGY_LOWER_LIMIT = { 1: 300 }

export const creepCfgMap: creepCfgMap = {
    'MIB': MIB_CFG,
    'harvester': HARVESTER_CFG,
    'carrier': CARRIER_CFG,
    'repairer': REPAIRER_CFG,
    'builder': BUILDER_CFG,
    'upgrader': UPGRADER_CFG,
}



export var creepConfig: roleInfoCard[] = [
    {
        role: 'MIB',
        body_parts: { 1: [[WORK, 1], [CARRY, 2], [MOVE, 2]] },
        max_count: 2,
        priority: 0
    },
    {
        role: 'harvester',
        body_parts: { 1: [[WORK, 2], [MOVE, 1]] },
        max_count: 2,
        priority: 1
    },
    {
        role: 'upgrader',
        body_parts: { 1: [[WORK, 1], [CARRY, 2], [MOVE, 1]] },
        max_count: 2,
        priority: 5
    },
    {
        role: 'carrier',
        body_parts: { 1: [[CARRY, 3], [MOVE, 3]] },
        max_count: 2,
        priority: 2
    },
    {
        role: 'builder',
        body_parts: { 1: [[WORK, 1], [CARRY, 2], [MOVE, 2]] },
        max_count: 2,
        priority: 4
    },
    {
        role: 'repairer',
        body_parts: { 1: [[WORK, 1], [CARRY, 2], [MOVE, 2]] },
        max_count: 1,
        priority: 3
    },

]


