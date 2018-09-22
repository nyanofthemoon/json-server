const path = require('path')
const faker = require('faker');
const jsonServer = require('json-server')
request = require('request')

const port = process.env.PORT || 8080;
const schema = process.env.SCHEMA || path.join(__dirname, 'public/schema/default.json');
const locale = process.env.LOCALE || 'en';

const server = jsonServer.create()
const middlewares = jsonServer.defaults({
  static: 'public',
  logger: false,
  bodyParser: true,
  noCors: false,
  readOnly: false
})

const router = jsonServer.router(schema)

server.use(middlewares)

server.get('/ping', (req, res) => {
  res.jsonp({
    timestamp: new Date().getTime(),
    locale,
    schema
  })
})

server.get('/puke/:quantity/:type/', (req, res) => {
  const type = req.params.type
  let quantity = parseInt(req.params.quantity)
  if (quantity < 0 || quantity > 100) {
    quantity = 0
  }

  let data = []
    for (let c=0; c<quantity; c++) {
      switch(type) {
        case 'user':
          data.push({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            title: faker.name.jobTitle(),
            phone: faker.phone.phoneNumber(),
            ip: faker.internet.ip(),
            avatar: faker.internet.avatar(),
            color: faker.commerce.color()
          });
          break;
        default:
          try {
            const parts = type.split('.')
            data.push(faker[parts[0]][parts[1]]())
          } catch (e) {}
          break;
      }
    }

  res.jsonp({
    docs: 'https://github.com/marak/Faker.js/#api-methods',
    type,
    quantity,
    data
  })
})

server.get('/placeholder/:size', (req, res) => {
  request('https://placeholdit.co/i/' + req.params.size + '?&bg=555555&text=' + req.params.size).pipe(res)
})

server.use(jsonServer.rewriter({
  '/api/*': '/$1'
}))

server.use(jsonServer.bodyParser)

server.use(router)

faker.locale = locale

server.listen(port, () => {
  console.log(`[Mock API] Port ${port} using ${schema}`)
})