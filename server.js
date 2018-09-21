const path = require('path')
const faker = require('faker');
const jsonServer = require('json-server')

const port = process.env.PORT || 8080;
const schema = process.env.SCHEMA || 'default';
const server = jsonServer.create()
const middlewares = jsonServer.defaults({
  static: 'public',
  logger: false,
  bodyParser: true,
  noCors: false,
  readOnly: false
})

const router = jsonServer.router(path.join(__dirname, `${schema}.json`))

server.use(middlewares)

// Add custom routes before JSON Server router

server.get('/ping', (req, res) => {
  res.jsonp({
    timestamp: new Date().getTime(),
    schema
  })
})

server.get('/generate/:type', (req, res) => {
  const type = req.params.type
  let data = {}

  switch(type) {
    case 'user':
        const card = faker.helpers.createCard()
        data.name = card.name
        data.username = card.username
        data.password = faker.internet.password()
        data.email = card.email
        data.phone = card.phone
        data.website = card.website
        data.address = card.address
        break;
    default: break;
  }

  res.jsonp({
    type,
    data
  })
})

// Route rewriter
server.use(jsonServer.rewriter({
  '/api/*': '/$1'
}))

server.use(jsonServer.bodyParser)

server.use(router)

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`)
})