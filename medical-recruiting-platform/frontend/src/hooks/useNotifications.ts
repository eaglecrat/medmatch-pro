import { useEffect, useState } from 'react'
import { notificationsAPI } from '../services/api'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import io from 'socket.io-client'

export function useNotifications() {
  const queryClient = useQueryClient()
  const [socket, setSocket] = useState<any>(null)

  const { data: notifications } = useQuery('notifications', () =>
    notificationsAPI.getMyNotifications().then(r => r.data)
  )

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0

  const markRead = useMutation(
    (id: string) => notificationsAPI.markRead(id),
    { onSuccess: () => queryClient.invalidateQueries('notifications') }
  )

  const markAllRead = useMutation(
    () => notificationsAPI.markAllRead(),
    { onSuccess: () => queryClient.invalidateQueries('notifications') }
  )

  useEffect(() => {
    const s = io(import.meta.env.VITE_API_URL || '')
    setSocket(s)

    s.on('notification', (data: any) => {
      queryClient.invalidateQueries('notifications')
    })

    return () => { s.disconnect() }
  }, [queryClient])

  return { notifications, unreadCount, markRead, markAllRead }
}
