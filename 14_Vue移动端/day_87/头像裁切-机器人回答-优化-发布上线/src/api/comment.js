import http from '@/utils/http'

/**
 * 获取文章的评论
 * @param {*} articleId 文章编号
 * @param {*} offset 获取评论数据的偏移量，值为评论id，表示从此id的数据向后取，不传表示从第一页开始读取数据
 */
export const reqGetComments = (articleId, offset) => {
  return http({
    method: 'get',
    url: '/v1_0/comments',
    params: {
      type: 'a', // a表示对文章的评论 ,c表示对评论的回复
      source: articleId,
      offset
    }
  })
}

/**
 * 对文章进行评论
 * @param {*} articleId 文章编号
 * @param {*} content 评论内容
 */
export const reqAddComment = (articleId, content) => {
  return http({
    method: 'post',
    url: '/v1_0/comments',
    data: {
      target: articleId,
      content
    }
  })
}

/**
 * 对文章评论进行点赞
 * @param {*} commentId 评论id
 */
export const reqAddCommentLike = commentId => {
  return http({
    method: 'post',
    url: '/v1_0/comment/likings',
    data: {
      target: commentId
    }
  })
}

/**
 * 取消文章评论的点赞
 * @param {*} commentId 评论id
 */
export const reqDeleteCommentLike = commentId => {
  return http({
    method: 'delete',
    url: '/v1_0/comment/likings/' + commentId
  })
}

/**
 * 获取文章评论回复
 * @param {*} commentId 回复的评论id
 * @param {*} offset 获取评论数据的偏移量，值为评论id，表示从此id的数据向后取，不传表示从第一页开始读取数据
 */
export const reqGetCommentsReply = (commentId, offset) => {
  return http({
    method: 'get',
    url: '/v1_0/comments',
    params: {
      type: 'c', // a表示对文章的评论 ,c表示对评论的回复
      source: commentId,
      offset
    }
  })
}

/**
 * 添加文章评论回复
 * @param {*} commentId 评论id
 * @param {*} content 内容
 * @param {*} articleId 文章id
 */
export const reqAddCommentReply = (commentId, content, articleId) => {
  return http({
    method: 'post',
    url: '/v1_0/comments',
    data: {
      target: commentId,
      content,
      art_id: articleId
    }
  })
}
