import http from '@/utils/http'

/**
 * 用户登录
 * @param {*} mobile 手机号
 * @param {*} code 验证码(密码)
 */
export const reqLogin = (mobile, code) => {
  return http({
    method: 'post',
    url: '/v1_0/authorizations',
    data: {
      mobile,
      code
    }
  })
}

/**
 * 获取用户信息
 */
export const reqGetProfile = () => {
  return http({
    method: 'get',
    url: '/v1_0/user/profile'
  })
}

/**
 * 关注用户
 * @param {*} userId 作者的id
 */
export const reqFollowUser = userId => {
  return http({
    method: 'post',
    url: '/v1_0/user/followings',
    data: {
      target: userId
    }
  })
}
/**
 * 取消关注用户
 * @param {*} userId 作者的id
 */
export const reqUnFollowUser = userId => {
  return http({
    method: 'delete',
    url: '/v1_0/user/followings/' + userId
  })
}

/**
 * 刷新用户token
 */
export const reqPutNewToken = refreshToken => {
  return http({
    method: 'put',
    url: '/v1_0/authorizations',
    headers: {
      Authorization: `Bearer ${refreshToken}`
    }
  })
}

/**
 * 获取用户个人信息 (用于个人中心页的渲染数据)
 */
export const reqGetUserInfo = () => {
  return http({
    method: 'get',
    url: '/v1_0/user'
  })
}

/**
 * 修改用户个人信息
 * obj {
 *   name: 昵称,
 *   birthday: 生日
 *   gender: 性别
 * }
 */
export const reqUpdateUserInfo = obj => {
  return http({
    method: 'patch',
    url: '/v1_0/user/profile',
    data: obj
  })
}

/**
 * 修改用户头像
 * @param {*} formData 收集文件对象的formData
 */
export const reqUpdatePhoto = formData => {
  return http({
    method: 'patch',
    url: '/v1_0/user/photo',
    data: formData
  })
}
