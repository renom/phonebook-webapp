import Vue from 'vue'
import { Validator } from 'vee-validate'

export default ({ app }, inject) => {
    app.v = new Validator()
    app.validate = async (value, rules) => {
        const { valid } = await app.v.verify(value, rules)
        return valid
    }
}
