<template>
    <b-modal :id="id" :title="title" @ok="$emit('ok')" centered :ok-disabled="!isFormValidated || errors.any()">
        <b-container fluid>
            <b-row class="mb-1">
            <b-form-input
                name="surname"
                :state="validateState('surname')"
                aria-describedby="surnameFeedback"
                type="text"
                placeholder="Enter your surname"
                v-model="contact.surname"
                v-validate="'required|max:45'"
                maxlength="45"
            />
            <b-form-invalid-feedback id="surnameFeedback">
                {{ errors.first('surname') }}
            </b-form-invalid-feedback>
            </b-row>
            <b-row class="mb-1">
            <b-form-input
                name="name"
                :state="validateState('name')"
                aria-describedby="nameFeedback"
                type="text"
                placeholder="Enter your name"
                v-model="contact.name"
                v-validate="'required|max:45'"
                maxlength="45"
            />
            <b-form-invalid-feedback id="nameFeedback">
                {{ errors.first('name') }}
            </b-form-invalid-feedback>
            </b-row>
            <b-row class="mb-1">
            <b-form-input
                name="patronymic"
                :state="validateState('patronymic')"
                aria-describedby="patronymicFeedback"
                type="text"
                placeholder="Enter your patronymic"
                v-model="contact.patronymic"
                v-validate="'required|max:45'"
                maxlength="45"
            />
            <b-form-invalid-feedback id="patronymicFeedback">
                {{ errors.first('patronymic') }}
            </b-form-invalid-feedback>
            </b-row>
            <b-row class="mb-1" v-for="(phone, index) in contact.phones" :key="index">
            <b-input-group>
                <b-form-input
                name="'phone_' + index"
                placeholder="Input a phone number"
                v-model="contact.phones[index].number"
                v-validate="{ required: true, regex:/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/ }"
                v-mask="'+7 (###) ###-##-##'"
                />
                <b-input-group-append>
                <b-btn variant="success" v-if="index === 0" @click="contact.phones.push({number: ''})">Add</b-btn>
                <b-btn variant="danger" v-else @click="contact.phones.splice(index, 1)">Remove</b-btn>
                </b-input-group-append>
            </b-input-group>
            </b-row>
        </b-container>
    </b-modal>
</template>

<script>
export default {
    props: {
        id: {
            type: String,
        },
        title: {
            type: String,
        },
        contact: {
            type: Object,
            required: true
        }
    },
    computed: {
        isFormValidated() {
            return Object.keys(this.veeFields).every(key => this.veeFields[key].validated);
        }
    },
    methods: {
        validateState(ref) {
            if (this.veeFields[ref] && (this.veeFields[ref].dirty || this.veeFields[ref].validated)) {
                return !this.errors.has(ref)
            }
            return null
        },
        reset() {
            this.contact.surname = ''
            this.contact.name = ''
            this.contact.patronymic = ''
            this.contact.phones = [{number: ''}]
            this.$validator.reset()
        }
    }
}
</script>
