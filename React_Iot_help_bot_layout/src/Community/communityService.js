import api from '../apiClient';

// base URL prefix used for all community API endpoints
const BASE_URL = '/community';

// creates a new community post with the provided data
export async function create(data) {
  return await api.post(BASE_URL, data);
}

// fetches all posts, optionally filtered by tag and/or search query
export async function list(tag, search) {
  return await api.get(BASE_URL, { params: { tag, search } });
}

// fetches a single post by its ID, including its full replies
export async function get(id) {
  return await api.get(`${BASE_URL}/${id}`);
}

// adds a top-level reply to a post
export async function reply(id, content) {
  return await api.post(`${BASE_URL}/${id}/reply`, { content });
}

// toggles an upvote on a post for the current user
export async function upvote(id) {
  return await api.post(`${BASE_URL}/${id}/upvote`);
}

// searches for posts with a similar title to help avoid duplicates
export async function checkSimilar(title) {
  return await api.get(`${BASE_URL}/similar`, { params: { title } });
}

// adds a nested reply to a specific comment on a post
export async function replyToComment(postId, commentId, content) {
  return await api.post(`${BASE_URL}/${postId}/reply/${commentId}`, { content });
}

// toggles a rating (like) on a top-level comment
export async function rateComment(postId, commentId) {
  return await api.post(`${BASE_URL}/${postId}/reply/${commentId}/rate`);
}

// toggles a rating on a nested (child) reply
export async function rateNestedComment(postId, commentId, nestedReplyId) {
  return await api.post(`${BASE_URL}/${postId}/reply/${commentId}/nested/${nestedReplyId}/rate`);
}

// updates the content of an existing comment
export async function editComment(postId, commentId, content) {
  return await api.put(`${BASE_URL}/${postId}/reply/${commentId}`, { content });
}
