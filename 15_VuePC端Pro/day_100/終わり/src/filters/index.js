import moment from 'moment'

export function formatDate(value, str = 'YYYY-MM-DD') {
  return moment().format(str)
}

