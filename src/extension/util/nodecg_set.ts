// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import NodeCG from 'nodecg/types'

let nodecg: NodeCG.ServerAPI | undefined
export function setNodeCG (_nodecg: NodeCG.ServerAPI): void {
  nodecg = _nodecg
}
export function getNodeCG (): NodeCG.ServerAPI {
  if (nodecg === undefined) {
    throw new Error()
  }
  return nodecg
}
