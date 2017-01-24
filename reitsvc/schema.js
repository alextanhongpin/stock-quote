import Ajv from 'ajv'
import Toolbox from '../common/toolbox.js'
const ajv = Ajv({
  allErrors: true,
  removeAdditional: true,
  useDefaults: true,
  schemas: [
    require('./schema/get-reits-response.json')
  ]
})
const parser = Toolbox.Parser(ajv)
export default {
  getReitsResponse: parser.request('http://localhost:3000/schemas/get-reits-request.json#')
}
