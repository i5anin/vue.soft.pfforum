import Vuex from 'vuex'
import EditorToolStore from '@/modules/editor-tool/store'
import StorageToolStore from '@/modules/storage-tool/store'
import IssueToolStore from '@/modules/issue-tool/store'

const store = new Vuex.Store({
  modules: { StorageToolStore, IssueToolStore, EditorToolStore },
})

export default store
