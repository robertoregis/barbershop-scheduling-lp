<script lang="ts">
    import { useField, useForm } from 'vee-validate';
    export default {
        props: {
            isActive: {
                type: Boolean,
                required: true
            },
            loginUser: {
                type: Function,
                required: true
            },
            closeDialogLogin: {
                type: Function,
                required: true
            },
            clearLogin: {
                type: Boolean,
                required: true
            },
            openRegister: {
                type: Function,
                required: true
            },
        },
        setup(props) {
            const isActive = toRef(props, 'isActive')
            const loginUser: any = toRef(props, 'loginUser')
            const closeDialogLogin = toRef(props, 'closeDialogLogin')
            const clearLogin = toRef(props, 'clearLogin')
            const openRegister = toRef(props, 'openRegister')
            const optionsPhone = { mask: '(##) #####-####' }
            const showPassword = ref<boolean>(false)

            const { handleSubmit, handleReset } = useForm({
                validationSchema: {
                    email (value: any) {
                        if (value?.length >= 0) return true
                        return 'O email precisa ser informado'
                    },
                    password(value: any) {
                        if (value?.length >= 5) return true
                        return 'A senha precisa ter mais de 5 caracteres'
                    },
                },
            })

            const email = useField('email')
            const password = useField('password')

            const submit = handleSubmit(values => {
                //alert(JSON.stringify(values, null, 2))
                loginUser.value(email.value.value, password.value.value)
            })

            watch(clearLogin, (newValew: any) => {
                if(clearLogin.value) {
                    handleReset()
                }
            })

            return {
                isActive,
                loginUser,
                email,
                password,
                optionsPhone,
                closeDialogLogin,
                submit,
                handleReset,
                openRegister,
                showPassword
            }
        }
    }
</script>
<template>
    <v-dialog width="600" v-model="isActive">
    <template v-slot:default="{ isActive }">
        <v-card :title="user ? `Sair da conta` : `Entrar na conta`" subtitle="Barbearia do Bronxs">
        <v-card-text>
            <div class="grid grid-cols-1">
                <div class="col-span-1">
                    <div class="grid grid-cols-1">
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
                        <div class="col-span-1 mt-3">
                            <div class="flex items-center">
                                <span class="text-sm mr-2">Ainda não tem conta?</span>
                                <v-btn @click="openRegister()" color="indigo-darken-3" size="small">Cadastre-se</v-btn>
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
                Logar
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
                @click="closeDialogLogin()"
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