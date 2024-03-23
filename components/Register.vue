<script lang="ts">
    import { useField, useForm } from 'vee-validate';

    export default {
        props: {
            isActiveRegister: {
                type: Boolean,
                required: true
            },
            createUser: {
                type: Function,
                required: true
            },
            closeDialogRegister: {
                type: Function,
                required: true
            },
            clearRegister: {
                type: Boolean,
                required: true
            },
            openLogin: {
                type: Function,
                required: true
            },
        },
        setup(props) {
            const isActiveRegister = toRef(props, 'isActiveRegister')
            const createUser: any = toRef(props, 'createUser')
            const closeDialogRegister = toRef(props, 'closeDialogRegister')
            const clearRegister = toRef(props, 'clearRegister')
            const openLogin = toRef(props, 'openLogin')
            const optionsPhone = { mask: '(##) #####-####' }
            const showPassword = ref<boolean>(false)

            const { handleSubmit, handleReset } = useForm({
                validationSchema: {
                    name (value: any) {
                        if (value?.length >= 3) return true
                        return 'O nome precisa ter no mínimo três caracteres'
                    },
                    email (value: any) {
                        if (value?.length >= 0) return true
                        return 'O email precisa ser informado'
                    },
                    password(value: any) {
                        if (value?.length >= 5) return true
                        return 'A senha precisa ter mais de 5 caracteres'
                    },
                    phone (value: any) {
                        return true
                    },
                },
            })

            const name = useField('name')
            const email = useField('email')
            const password = useField('password')
            const phone = useField('phone')

            const submit = handleSubmit(values => {
                //alert(JSON.stringify(values, null, 2))
                createUser.value(name.value.value, email.value.value, password.value.value, phone.value.value)
            })

            watch(clearRegister, (newValew: any) => {
                if(clearRegister.value) {
                    handleReset()
                }
            })

            return {
                isActiveRegister,
                createUser,
                name,
                email,
                password,
                phone,
                optionsPhone,
                closeDialogRegister,
                submit,
                handleReset,
                openLogin,
                showPassword
            }
        }
    }
</script>
<template>
    <v-dialog width="600" v-model="isActiveRegister">
    <template v-slot:default="{ isActiveRegister }">
        <v-card title="Cadastrar conta" subtitle="Barbearia do Bronxs">
        <v-card-text>
            <div class="grid grid-cols-1">
                <div class="col-span-1">
                    <div class="grid grid-cols-1">
                        <div class="col-span-1">
                            <v-text-field
                            label="Nome"
                            hide-details="auto"
                            base-color="indigo-darken-3"
                            color="indigo-darken-3"
                            type="text"
                            v-model="name.value.value"
                            :error-messages="name.errorMessage.value"
                            ></v-text-field>
                        </div>
                        <div class="col-span-1 mt-2">
                            <v-text-field
                            label="Email"
                            placeholder="seuemail@gmail.com"
                            type="email"
                            base-color="indigo-darken-3"
                            color="indigo-darken-3"
                            hide-details="auto"
                            v-model="email.value.value"
                            :error-messages="email.errorMessage.value"
                            ></v-text-field>
                        </div>
                        <div class="col-span-1 mt-2">
                            <v-text-field
                            hint="Escolha uma senha segura"
                            label="Senha"
                            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            :type="showPassword ? 'text' : 'password'"
                            @click:append="showPassword = !showPassword"
                            clearable
                            base-color="indigo-darken-3"
                            color="indigo-darken-3"
                            hide-details="auto"
                            v-model="password.value.value"
                            :error-messages="password.errorMessage.value"
                            ></v-text-field>
                        </div>
                        <div class="col-span-1 mt-2">
                            <v-text-field
                            label="Telefone"
                            type="input"
                            clearable
                            base-color="indigo-darken-3"
                            color="indigo-darken-3"
                            hide-details="auto"
                            v-model="phone.value.value"
                            :error-messages="phone.errorMessage.value"
                            v-maska:[optionsPhone]
                            ></v-text-field>
                        </div>
                        <div class="col-span-1 mt-2">
                            <div class="flex flex-col md:flex-row items-start md:items-center">
                                <span class="text-sm md:mr-2 my-1">Já tem conta?</span>
                                <v-btn @click="openLogin()" color="indigo-darken-3" class="my-1" size="small">Login</v-btn>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                class="text-none"
                color="green-darken-4"
                variant="flat"
                @click="submit"
            >
                Registrar
            </v-btn>
            <v-btn
                class="text-none"
                color="yellow-darken-4"
                variant="flat"
                @click="handleReset"
            >
                Limpar
            </v-btn>
            <v-btn
                class="text-none"
                color="red-darken-4"
                variant="flat"
                @click="closeDialogRegister()"
            >
                Fechar
            </v-btn>
        </v-card-actions>
        </v-card>
    </template>
    </v-dialog>
</template>
<style lang="scss" scoped>
    
</style>