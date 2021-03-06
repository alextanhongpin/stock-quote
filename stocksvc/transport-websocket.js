import Service from './service.js'
import Stock from './model.js'

import ws from 'ws'

const WebSocketServer = ws.Server

const wss = new WebSocketServer({
  port: process.env.WEBSOCKET_PORT,
  verifyClient(info, callback) {
    const token = info.req.headers.token
    if (!token) {
      callback(false, 401, 'Unauthorized')
    } else {
      jwt.verify(token, 'secret-key', function (error, decoded) {
        if (error) {
          callback(false, 401, 'Unauthorized')
        } else {
          info.req.user = decoded
          callback(true)
        }
      })
    }
  }
})

let symbols = []
let refreshDuration = 15000 // 15 seconds

const service = Service({ Stock })

wss.on('connection', (ws) => {
  // Get the user data
  // var user = conn.upgradeReq.user
  let interval = null

  function sendStockUpdates (ws) {
    if (ws.readyState === 1) {
      // Do checking to see if symbols exists

      if (symbols && symbols.length) {
        service.getStocks({ symbols }).then((json) => {
          ws.send(JSON.stringify(json))
        })
      } else {
        console.log('...no symbols to fetch')
      }
    }
  }
  interval = setInterval(() => {
    sendStockUpdates(ws)
  }, refreshDuration)

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg)
      symbols = data.symbols || []
      sendStockUpdates(ws)
    } catch (err) {
      console.log(err)
    }
  })

  ws.on('close', () => {
    clearInterval(interval)
  })
})

// app.listen(4000, () => {
//   console.log('listening to port*:' + 4000)
// })

