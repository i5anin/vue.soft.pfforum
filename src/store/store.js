import Vuex from 'vuex'
import EditorToolStore from '@/modules/editor-tool/store'
// import StorageToolStore from '@/modules/storage-tool/store'
import IssueToolStore from '@/modules/issue-tool/store'
import AuthStore from './authStore'

const store = new Vuex.Store({
  modules: { IssueToolStore, EditorToolStore, AuthStore },
})

// StorageToolStore

export default store
