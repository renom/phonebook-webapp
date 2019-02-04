<template>
  <section class="container">
    <div>
      <logo />
      <h1 class="title">
        phonebook-webapp
      </h1>
      <h2 class="subtitle">
        Test task for Profitclicks
      </h2>
      <b-container fluid>
        <b-row class="mb-2">
          <b-col md="6">
            <b-input-group>
              <b-form-input v-model="filter" placeholder="Type to Search" />
              <b-input-group-append>
                <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
              </b-input-group-append>
            </b-input-group>
          </b-col>
          <b-col md="6" class="text-right align-self-center">
            <b-button size="sm" variant="success" @click.stop="createForm()">Add a contact</b-button>
          </b-col>
        </b-row>
        <b-row>
          <b-modal id="modalRemove" centered title="Delete confirmation" @ok="remove()">
            <p class="my-4">Are you sure want to delete this contact?</p>
          </b-modal>
          <edit-contact id="modalCreate" ref="modalCreate" title="Create a contact" @ok="create()" :contact="newContact" />
          <edit-contact id="modalUpdate" ref="modalUpdate" title="Edit a contact" @ok="update()" :contact="contact" />
        </b-row>
        <b-row>
          <b-table striped hover :fields="fields" :items="contacts" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" no-local-sorting>
            <template slot="numbers" slot-scope="data">
              <div v-for="phone in data.item.phones" :key="phone.id">
                {{ formatPhone(phone.number) }}
              </div>
            </template>
            <template slot="actions" slot-scope="data">
              <b-button size="sm" variant="primary" @click.stop="updateForm(data.item)">Edit</b-button>
              <b-button size="sm" variant="danger" @click.stop="removeForm(data.item.id)">Delete</b-button>
            </template>
          </b-table>
        </b-row>
        <b-row>
          <b-col md="6" class="my-1">
            <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="page" class="my-0" />
          </b-col>
        </b-row>
      </b-container>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import { mapState, mapGetters } from 'vuex'
import Logo from '~/components/Logo.vue'
import EditContact from '~/components/EditContact.vue'

export default {
  components: {
    Logo,
    EditContact,
  },
  data() {
    return {
      fields: {
        fullname: {
          label: "Full name",
          sortable: true
        },
        updated_at: {
          label: "Modified at",
          sortable: true
        },
        created_at: {
          label: "Created at",
          sortable: true
        },
        numbers: {
          label: "Phone numbers"
        },
        actions: {
          label: "Actions"
        }
      },
      // Contact to edit
      contact: {
        surname: "",
        name: "",
        patronymic: "",
        phones: [{number: ''}]
      },
      // Contact to create
      newContact: {
        surname: "",
        name: "",
        patronymic: "",
        phones: [{number: ''}]
      },
      contactIdToRemove: null
    }
  },
  async asyncData({ app, store, query }) {
    if (await app.validate(query.page, 'required|integer|min_value:1')) {
      store.commit('updatePage', query.page)
    }
    if (await app.validate(query.sort, 'required|included:fullname,-fullname,updated_at,-updated_at,created_at,-created_at')) {
      store.commit('updateSort', query.sort)
    }
    if (await app.validate(query.filter, 'required')) {
      store.commit('updateFilter', query.filter)
    }
    let contacts = await store.dispatch('getContacts')
    return {
      contacts: contacts.data.data,
      perPage: contacts.data.per_page,
      totalRows: contacts.data.total,
    }
  },
  computed: {
    page: {
      get() {
        return this.$store.state.page
      },
      set(value) {
        this.$store.commit('updatePage', value)
      }
    },
    sortBy: {
      get() {
        return this.$store.state.sortBy
      },
      set(value) {
        if (value !== null) {
          this.$store.commit('updateSortBy', value)
        }
      }
    },
    sortDesc: {
      get() {
        return this.$store.state.sortDesc
      },
      set(value) {
        if (value !== null) {
          this.$store.commit('updateSortDesc', value)
        }
      }
    },
    sort: {
      get() {
        return this.$store.getters.sort
      },
      set(value) {
        if (value !== null) {
          this.$store.commit('updateSort', value)
        }
      }
    },
    filter: {
      get() {
        return this.$store.state.filter
      },
      set(value) {
        this.$store.commit('updateFilter', value)
      }
    }
  },
  watch: {
    page() {
      this.updateQueryString()
      this.reload()
    },
    sort(val) {
      this.updateQueryString()
      this.reload()
    },
    filter() {
      this.updateQueryString()
      this.reload()
    }
  },
  methods: {
    updateQueryString() {
      this.$router.push({path: this.$route.path, query: { page: this.page, sort: this.sort, ...(this.filter ? { filter: this.filter } : {}) }})
    },
    reload() {
      this.$store.dispatch('getContacts').then((res) => { this.contacts = res.data.data; this.perPage = res.data.per_page; this.totalRows = res.data.total })
    },
    createForm() {
      this.$root.$emit('bv::show::modal', 'modalCreate')
    },
    create() {
      let newContact = Object.assign({}, this.newContact)
      newContact.phones = this.parsePhones(newContact.phones)
      this.$store.dispatch('postContact', newContact).then((res) => { this.$refs.modalCreate.reset(); this.reload() })
    },
    updateForm(contact) {
      this.contact = Object.assign({}, contact)
      this.contact.phones = this.formatPhones(this.contact.phones)
      this.$root.$emit('bv::show::modal', 'modalUpdate')
    },
    update() {
      let contact = Object.assign({}, this.contact)
      contact.phones = this.parsePhones(contact.phones)
      this.$store.dispatch('patchContact', contact).then((res) => { this.$refs.modalUpdate.reset(); this.reload() })
    },
    removeForm(contact_id) {
      this.contactIdToRemove = contact_id
      this.$root.$emit('bv::show::modal', 'modalRemove')
    },
    remove() {
      this.$store.dispatch('deleteContact', this.contactIdToRemove).then((res) => { this.reload() })
    },
    formatPhones(phones) {
      return phones.map(element => { element = Object.assign({}, element); element.number = this.formatPhone(element.number); return element })
    },
    formatPhone(value) {
      return value.replace(/\+7(\d{3})(\d{3})(\d{2})(\d{2})/, '+7 ($1) $2-$3-$4')
    },
    parsePhones(phones) {
      return phones.map(element => { element = Object.assign({}, element); element.number = this.parsePhone(element.number); return element })
    },
    parsePhone(value) {
      return value.replace(/[^\d\+]/g, '')
    },
  },
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
