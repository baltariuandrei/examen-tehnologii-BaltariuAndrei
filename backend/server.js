const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const mysql = require('mysql')
const cors = require('cors')
const path = require ('path')
const http = require('http');
const { where } = require('sequelize')

const port = process.env.PORT || 5050;
require('dotenv').config()

const LikeOperator = Sequelize.Op.like;
const sequelize = new Sequelize(process.env.DATABASE_URL, {
	dialect : 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnathorized: false
        }
    }
});

const Article = sequelize.define('article', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    titlu: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [5, 50]
        }
    },

    rezumat: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [10, 100]
        }
    },

    data: {
        type: Sequelize.DATE
    }
});

const Reference = sequelize.define('reference', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        operatorsAliases: false
    },

    titlu: {
        type: Sequelize.STRING,
        operatorsAliases: false,
        validate: {
            len: [5, 30]
        }
    },

    data: {
        type: Sequelize.DATE
    },

    autori: {
        type: Sequelize.STRING
    }
});



Article.hasMany(Reference)
const app = express()
app.use(cors())
app.use(express.static(path.join(__dirname, 'build')))
app.use(bodyParser.json())
app.get('/createDB', async ( req, res ) => 
    {
        try {
            await sequelize.sync(
                {
                    force: true
                }
            )
            res.status(201).json(
                {
                    message: 'created'
                }
            )
        } catch (e)
        {
            console.warn(e)
            res.status(500).json(
                {
                    message: 'server error'
                }
            )
        }
    }
)

//ROUTES
app.get('/getArticles', async (req, res) => {
    try {
        let articles = await Article.findAll()
        res.status(200).json(articles)
    } catch(e) {
        console.warn(e)
        res.status(500).json(
            {
                message: 'server error'
            }
        )
    }
});

app.post('/addArticle', async (req, res) => {
    try {
        if (req.query.bulk && req.query.bull == 'on')
        {
            await Article.bulkCreate(req.body)
            res.status(201).json(
                {
                    message: 'created'
                }
            )
        }
        else
        {
            await Article.create(req.body)
            res.status(201).json(
                {
                    message: 'created'
                }
            )
        }
    } catch (err)
    {
        console.warn(err)
        res.status(500).json(
            {
                message: 'server error'
            }
        )
    }
});

app.get('/getArticleById/:id', async (req, res) => 
{
    try {
        let article = await Article.findByPk(req.params.id)
        if (article)
        {
            res.status(200).json(article)
        }
        else
        {
            res.status(404).json(
                {
                    message: 'article not found'
                }
            )
        }
    } catch (err)
    {
        console.warn(err)
        res.status(500).json(
            {
                message: 'server error'
            }
        )
    }
});

app.put('/updateArticle/:id', async (req, res) => 
{
    try {
        let article = await Article.findByPk(req.params.id)
        if (article)
        {
            await article.update(req.body)
            res.status(202).json(
                {
                    message: 'modified'
                }
            )
        }
        else
        {
            console.warn(e)
            res.status(500).json(
                {
                    message: 'server error'
                }
            )
        }
    } catch(err)
    {
        console.warn(err)
        res.status(500).json(
            {
                message: 'server error'
            }
        )
    }
});

app.delete('/deleteArticle/:id', async (req, res) => 
{
    try {
        let article = await Article.findByPk(req.params.id)
        if (article)
        {
            await article.destroy()
            res.status(202).json(
                {
                    message: 'deleted'
                }
            )
        }
        else
        {
            res.status(404).json(
                {
                    message: 'not found'
                }
            )
        }
    } catch(err)
    {
        console.warn(err)
        res.status(500).json(
            {
                message: 'server error'
            }
        )
    }
})

app.get('/articles/:id/getReferences', async (req, res) => {
    try {
        let article = await Article.findByPk(req.params.id)
        if (article)
        {
            let reference = await article.getReferences()
            res.status(200).json(reference)
        }
        else
        {
            res.status(404).json(
                {
                    message: 'not found'
                }
            )
        }
    } catch(err)
    {
        console.warn(err)
        res.status(500).json(
            {
                message: 'server error'
            }
        )
    }
});

app.get('/articles/:aid/getReferenceById/:bid', async(req, res) => 
{
    try {
        let article = await Article.findByPk(req.params.aid)
        if (article)
        {
            let reference = await article.getReferences(
                {
                    where: {
                        id: req.params.bid
                    }
                }
            )
            res.status(202).json(reference.shift())
        }
        else
        {
            res.status(404).json(
                {
                    message: 'not found'
                }
            )
        }
    } catch(err)
    {
        console.warn(err)
        res.status(500).json(
            {
                message: 'server error'
            }
        )
    }
});

app.post('/articles/:aid/addReference', async(req, res) => 
{
    try {
        let article = await Article.findByPk(req.params.aid)
        if (article)
        {
            let reference = req.body
            reference.article_id = article.id
            await Reference.create(reference)
            res.status(201).json(
                {
                    message: 'created'
                }
            )
        }
        else
        {
            res.status(404).json(
                {
                    message: 'not found'
                }
            )
        }
    } catch(err)
    {
        console.warn(err)
        res.status(500).json(
            {
                message: 'server error'
            }
        )
    }
});

app.put('/articles/:aid/updateReference/:bid', async(req, res) => 
{
    try {
        let article = await Article.findByPk(req.params.aid)
        if (article)
        {
            let reference = await article.getReferences(
                {
                    where: {
                        id: req.params.bid
                    }
                }
            )
            reference = reference.shift()
            if (reference)
            {
                await reference.update(req.body)
                res.status(202).json(
                    {
                        message: 'modified'
                    }
                )
            }
            else
            {
                res.status(404).json(
                    {
                        message: 'not found'
                    }
                )
            }
        }
    } catch(err)
    {
        console.warn(err)
        res.status(500).json(
            {
                message: 'server error'
            }
        )
    }
});

app.delete('/articles/:aid/deleteReference/:bid', async(req, res) => 
{
    try {
        let article = await Article.findByPk(req.params.aid)
        if (article)
        {
            let reference = await article.getReferences(
                {
                    where: {
                        id: req.params.bid
                    }
                }
            )
            reference = reference.shift()
            if (reference)
            {
                await reference.destroy(req.body)
                res.status(202).json(
                    {
                        message: 'deleted'
                    }
                )
            }
            else
            {
                res.status(404).json(
                    {
                        message: 'reference not found'
                    }
                )
            }
        }
        else
        {
            res.status(404).json(
                {
                    message: 'article not found'
                }   
                
            )
        }
    } catch(err)
    {
        console.warn(err)
        res.status(500).json(
            {
                message: 'server error'
            }
        )
    }
});

async function filterArticle(filterQuery)
{
    let whereClause = {};

    if (filterQuery.titlu)
    {
        whereClause.ArticleTitlu = { [LikeOperator]: `%${filterQuery.titlu}%` };
    }

    if (filterQuery.id)
    {
        whereClause.ArticleId = { [LikeOperator]: `%${filterQuery.id}%` };
    }
    console.log(whereClause)
    return await Article.findAll(
        {
            where: whereClause
        }
    )
}

app.get('/filterArticles', async(req, res) => 
{
    try {
        return res.status(200).json(
            await filterArticle(req.query)
        );
    } catch(err)
    {
        console.warn(err)
        res.status(500).json(
            {
                message: 'server error'
            }
        )
    }
})

app.post('/postArticle')
const server = http.createServer(app);
server.listen(process.env.PORT);
console.log('Serverul ruleaza la PORT-ul ' + port);