import express from 'express'

import isAuthenticated from '../middlewares/isAuthenticated.js';
import {  createPost, deletePost, getAllPofilePost, getFeed, likeOnComment, postComment, replyOnComment, toggleLikePost } from '../controllers/post.controller.js';
import upload from '../middlewares/multer.js';
const router= express.Router()

router.post('/',isAuthenticated,upload.single("image"), createPost)
router.delete('/:id',isAuthenticated,deletePost)
router.get('/',isAuthenticated,getAllPofilePost)
router.get('/feed',isAuthenticated,getFeed)
router.put('/like/:postId',isAuthenticated,toggleLikePost)
router.post('/comment/:postId',isAuthenticated,postComment)
router.post('/like-on-comment/:commentId',isAuthenticated,likeOnComment)
router.post('/reply-on-comment/:commentId',isAuthenticated,replyOnComment)

export default router;
