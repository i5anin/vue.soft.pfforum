import Vuex from 'vuex'
import { store as ToolModelStore } from '@/modules/tool/store'
import { store as IssueToolStore } from '@/modules/issue-tool/store'
import { store as ToolCatalogStore } from '@/modules/tool-catalog/store'
import { store as StorageCatalogStore } from '@/modules/storage-catalog/store'

const store = new Vuex.Store({
  modules: {
    tool: ToolModelStore,
    toolCatalog: ToolCatalogStore,
    issueTool: IssueToolStore,
    storageCatalogTool: StorageCatalogStore,
  },
})

export default store
