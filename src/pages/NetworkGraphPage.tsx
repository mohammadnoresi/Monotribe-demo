import { FriendNetworkGraph } from '../components/FriendNetworkGraph.tsx'

type NetworkGraphPageProps = {
  focusedMemberId: string | null
  onFocusHandled: () => void
}

export function NetworkGraphPage({ focusedMemberId, onFocusHandled }: NetworkGraphPageProps) {
  return <FriendNetworkGraph focusedMemberId={focusedMemberId} onFocusHandled={onFocusHandled} />
}
