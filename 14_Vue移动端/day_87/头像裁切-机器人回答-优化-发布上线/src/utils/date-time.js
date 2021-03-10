import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export const formatTime = val => {
  return dayjs(val).format('DD/MM/YYYY')
}

export const getRelativeTime = yourTime => {
  return dayjs(yourTime).fromNow()
}
