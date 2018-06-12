'use strict';

import express from 'express'
import Article from '../controllers/article'

const router = express.Router();

router.get('/addArticle',Article.addArticle);
router.post('/deleteArticle',Article.deleteArticle);
router.post('/editeArticle',Article.editeArticle);
router.post('/getArticles',Article.getArticles);
router.get('/getAllArticles',Article.getAllArticles);
router.get('/likeArticle',Article.likeArticle);
router.get('/changeArticleStatus',Article.changeArticleStatus);


export default router;