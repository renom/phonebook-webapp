export const state = () => ({
    counter: 0,
    page: 1,
    sortBy: 'created_at',
    sortDesc: true,
    filter: '',
})

export const getters = {
    sort: state => {
        if (state.sortDesc === true) {
            return '-' + state.sortBy
        }
        return state.sortBy
    }
}

export const mutations = {
    increment (state) {
        state.counter++
    },
    updatePage(state, page) {
        state.page = Number(page)
    },
    updateSortBy(state, sortBy) {
        state.sortBy = sortBy
    },
    updateSortDesc(state, sortDesc) {
        state.sortDesc = sortDesc
    },
    updateSort(state, sort) {
        if (sort.charAt(0) === '-') {
            state.sortBy = sort.substring(1)
            state.sortDesc = true
        } else {
            state.sortBy = sort
            state.sortDesc = false
        }
    },
    updateFilter(state, filter) {
        state.filter = filter
    },
}

export const actions = {
    async getContacts({ state, getters }) {
        let queryString = '?page=' + state.page + '&sort=' + getters.sort
        if (state.filter) {
            queryString += '&fullname=' + state.filter
        }
        return await this.$axios.get('http://127.0.0.1:8000/v1/contacts' + queryString)
    },
    async postContact({ dispatch }, newContact) {
        // Create a contact
        let contact = await this.$axios.post('http://127.0.0.1:8000/v1/contacts', {
            surname: newContact.surname,
            name: newContact.name,
            patronymic: newContact.patronymic
        })

        // Create all the phones
        newContact.phones.forEach(function(phone) {
            dispatch('postPhone', { phone, contact_id: contact.data.id })
        })

        // Return the created contact including created phones
        return await dispatch('getContact', contact.data.id)
    },
    async getContact({}, contact_id) {
        await this.$axios.get('http://127.0.0.1:8000/v1/contacts/' + contact_id)
    },
    async patchContact({ dispatch }, contact) {
        // Updating the contact
        await this.$axios.patch('http://127.0.0.1:8000/v1/contacts/' + contact.id, {
            surname: contact.surname,
            name: contact.name,
            patronymic: contact.patronymic
        })

        // An "update or create" action for phones
        contact.phones.forEach(function(phone) {
            if (phone.id) {
                dispatch('patchPhone', phone)
            } else {
                dispatch('postPhone', { phone, contact_id: contact.id })
            }
        })

        // Return the updated contact
        return await dispatch('getContact', contact.id)
    },
    async deleteContact({}, contact_id) {
        return await this.$axios.delete('http://127.0.0.1:8000/v1/contacts/' + contact_id)
    },
    async postPhone({}, { phone, contact_id }) {
        return await this.$axios.post('http://127.0.0.1:8000/v1/phones', {
            number: phone.number,
            contact_id: contact_id
        })
    },
    async patchPhone({}, phone) {
        return await this.$axios.patch('http://127.0.0.1:8000/v1/phones/' + phone.id, {
            number: phone.number
        })
    },
    async deletePhone({}, phone_id) {
        return await this.$axios.delete('http://127.0.0.1:8000/v1/phones/' + phone_id)
    },
}
