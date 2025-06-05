// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import NodeCG from 'nodecg/types'
import { setNodeCG } from './util/nodecg_set'

export = (nodecg: NodeCG.ServerAPI) => {
  setNodeCG(nodecg)
  require('./load')
}
