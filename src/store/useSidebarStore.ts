import { createWithEqualityFn } from 'zustand/traditional'

interface SidebarState {
  expanded: boolean
  hidden: boolean
  setExpanded: (value: boolean) => void
  setHidden: (value: boolean) => void
  toggleSidebar: () => void
}

const useSidebarStore = createWithEqualityFn<SidebarState>(
  set => ({
    expanded: false,
    hidden: false,
    setExpanded: value => set(state => ({ expanded: value })),
    setHidden: value => set(state => ({ hidden: value })),
    toggleSidebar: () => set(state => ({ expanded: !state.expanded })),
  }),
  Object.is,
)

export default useSidebarStore
