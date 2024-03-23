<script lang="ts">
    import { getAuth, signInWithCustomToken, signOut } from "firebase/auth";
    import { collection, getDocs, query, where, doc, getDoc, addDoc, Timestamp, updateDoc } from 'firebase/firestore';
    import { useToast } from 'vue-toastification';
    import { useFirebase } from '../composables/useFirebase';
    import { useData } from '../stores/data';
    import { addDays, format } from 'date-fns';
    import CryptoJS from 'crypto-js';
    import { useAuthentication } from '../stores/authentication';
    import { useCreate } from '../composables/createFirebase';
    import { useShow } from '../stores/show';

    import { useRouter } from 'vue-router';
    import { computed, onMounted, ref } from 'vue';

    export default {
        setup() {
            const data = useData()
            const authentication: any = useAuthentication()
            const show = useShow()
            // para mexer com as tags heads
            useHead({
                title: `Barbearia do Bronxs`,
                meta: [
                {
                    name: 'description',
                    content: 'Faça login no painel administrativo da IndicaPix, a empresa que conecta empresas e embaixadores para criar leads de alta qualidade.'
                }
                ]
            })
            // usando o firestore do firebase
            const { firestore, auth } = useFirebase()
            const { addInteraction, addWarning } = useCreate()
            const router = useRouter()
            const toast = useToast()
            const salt = useRuntimeConfig().public.SALT
            const config = ref<any>()
            const loading = ref<boolean>(true)
            const daySelected = ref<any>(null)
            const barberSelected = ref<any>(null)
            const typeAccount = ref<any>(null)
            const days = ref<any[]>([])
            const phase = ref<number>(1)
            const barbers = ref<any[]>([])
            const params = new URLSearchParams();
            const secretKeyAuth = useRuntimeConfig().public.SECRET_KEY_AUTH
            const isActive = ref<boolean>(false)
            const isActiveRegister = ref<boolean>(false)
            const password = ref<any>(null)
            const email = ref<any>(null)
            const clearRegister = ref<any>(false)
            const clearLogin = ref<any>(false)

            const nextDays = (days: number) => {
                let today = new Date();
                const nextDaysArray = [];
                for (let i = 0; i < days; i++) {
                    const data = addDays(today, i);
                    nextDaysArray.push(format(data, 'dd/MM/yyyy'));
                }
                return nextDaysArray
            }
            const getInfo = async () => {
                const docRef = doc(firestore, "Info", "config"); // Referência ao documento "config"
                const docSnapshot = await getDoc(docRef); // Obtém o snapshot do documento

                if (docSnapshot.exists()) {
                    const configData = docSnapshot.data(); // Dados do documento
                    config.value = configData
                    days.value = nextDays(config.value.days_to_schedule)
                    loading.value = false
                }
            }
            const dateFormatted = (date: any) => {
                let dateSplit = date.split("/")
                let newDate = dateSplit[0] + '/' + dateSplit[1]
                return newDate
            }
            const getBarbers = async () => {
                let q = query(collection(firestore, "Barbers"), where("is_active", "==", true));
                const querySnapshot = await getDocs(q);
                const barbersDoc: any = []
                querySnapshot.forEach((doc: any) => {
                    barbersDoc.push({
                        id: doc.id,
                        ...doc.data()
                    })
                });
                if(barbersDoc.length > 0) {
                    barbers.value = barbersDoc
                }
            }
            const createUser = async (name: string, email: string, passwordUser: string, phone?: string) => {
                show.setIsLoadingGlobal(true)
                const { password, passwordHash }: any = generatePassword(passwordUser)
                let dateTimestamp = Timestamp.fromDate(new Date())
                try {
                    const userDoc = await addDoc(collection(firestore, "Users"), {
                        name: name,
                        email: email,
                        password: passwordHash,
                        created_at: dateTimestamp,
                        updated_at: dateTimestamp,
                        city: '',
                        state: '',
                        phone_formatted: phone ? phone : '',
                        phone: '',
                        is_active: true,
                        age: null,
                        hairstyles: [],
                        image_id: '',
                        image_url: 'https://firebasestorage.googleapis.com/v0/b/app-barbearia-bronxs.appspot.com/o/avatar.png?alt=media&token=fe382f83-7697-4bdd-a1d1-6eddd6f3568c'
                    })
                    addInteraction({
                        text: `O usuário ${name} efetuou o cadastro`,
                        user_id: userDoc.id,
                        barber_id: "",
                        is_master: false,
                    })
                    addWarning({
                        type: "update",
                        text: `Foi feito o cadastro do usuário ${name}`,
                        user_id: userDoc.id,
                        barber_id: "",
                        is_master: false,
                    })
                    toast.success('Sucesso ao criar a conta')
                    let date = new Date()
                    generateTokenApi(name, userDoc.id, email, "user", date).then(async (response) => {
                        if(response.status) {
                            signInWithCustomToken(auth, response.token)
                            const userDocRef = doc(firestore, "Users", userDoc.id); // Referência ao documento "config"
                            const userDocSnapshot = await getDoc(userDocRef);
                            authentication.setUser({
                                id: userDocSnapshot.id,
                                ...userDocSnapshot.data()
                            })
                            authentication.setUserId(userDocSnapshot.id)
                            show.setIsLoadingGlobal(false)
                            toast.success('Sucesso ao logar')
                            clearRegister.value = true
                            isActiveRegister.value = false
                            isActive.value = false
                            await updateDoc(userDocRef, {
                                last_login: dateTimestamp,
                                updated_at: dateTimestamp
                            })
                        }
                    })
                } catch(error) {
                    console.log(error)
                    show.setIsLoadingGlobal(false)
                    toast.error('Erro ao criar a conta')
                }
            }
            const loginUser = async (email: string, passwordUser: string) => {
                show.setIsLoadingGlobal(true)
                const password = encryptedPassword(passwordUser)
                try {
                    let dateTimestamp = Timestamp.fromDate(new Date())
                    let q = query(collection(firestore, "Users"), where("email", "==", email), where("password", "==", password));
                    const querySnapshot = await getDocs(q);
                    const usersDoc: any = []
                    querySnapshot.forEach((doc: any) => {
                        usersDoc.push({
                            id: doc.id,
                            ...doc.data()
                        })
                    });
                    if(usersDoc.length > 0) {
                        authentication.setUser(usersDoc[0])
                        authentication.setUserId(usersDoc[0].id)
                        let date = new Date()
                        generateTokenApi(authentication.user.name, authentication.user.id, authentication.user.email, "user", date).then(async (response) => {
                            if(response.status) {
                                signInWithCustomToken(auth, response.token)
                                show.setIsLoadingGlobal(false)
                                toast.success('Sucesso ao logar')
                                clearLogin.value = true
                                isActive.value = false
                                isActiveRegister.value = false
                                addInteraction({
                                    text: `O usuário ${authentication.user.name} efetuou o login`,
                                    user_id: authentication.user.id,
                                    barber_id: "",
                                    is_master: false,
                                })
                                const userDocRef = doc(firestore, "Users", authentication.user.id); // Referência ao documento "config"
                                await updateDoc(userDocRef, {
                                    last_login: dateTimestamp,
                                    updated_at: dateTimestamp
                                })
                            } else {
                                console.log(response)
                            }
                        })
                    } else {
                        show.setIsLoadingGlobal(false)
                        toast.error('O email ou a senha está errado')
                    }
                } catch(error) {
                    console.log(error)
                    show.setIsLoadingGlobal(false)
                    toast.error('Erro ao entrar na conta')
                }
            }
            const logout = async () => {
                signOut(auth).then(() => {
                    authentication.setUserId('')
                    authentication.setUser({})
                    toast.success('Sucesso ao sair da conta')
                }).catch((error) => {
                    console.log(error)
                    toast.error('Erro ao sair da conta')
                })
            }
            const generateTokenApi = async (userName: string, userId: string, userEmail: string, type: string, date: Date) => {
                let formdataApi = {
                    name: userName,
                    id: userId,
                    email: userEmail,
                    dateLogin: date,
                    type: type,
                    keyAuth: secretKeyAuth
                }
                for (const [key, value] of Object.entries(formdataApi) as [string, any][]) {
                    params.append(key, value);
                }
                return await $fetch(`https://create-token-jwt-barber.onrender.com/token/custom-token-firebase-auth`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString(),
                }).then((response: any) => {
                    return {
                        status: response.token ? true : false,
                        token: response.token,
                        message: response.message
                    }
                }).catch((error) => {
                    setTimeout(() => {
                        toast.error('Infelizmente aconteceu um erro ao gerar o token')
                        router.push('/')
                    }, 1000)
                    let status = typeof error.response === "undefined" ? null : error.response.status
                    console.log(status)
                    return {
                        status: false,
                        token: null
                    }
                })
            }
            const generatePassword = (password: string) => {
                let hashedPassword = CryptoJS.PBKDF2(password, salt, {
                    keySize: 256/32,
                    iterations: 1000
                });
                let passwordHash = hashedPassword.toString()
                return {
                    password,
                    passwordHash
                }
            }
            const encryptedPassword = (password: string) => {
                let hashedPassword = CryptoJS.PBKDF2(password, salt, {
                    keySize: 256/32,
                    iterations: 1000
                });
                let passwordHash = hashedPassword.toString()
                return passwordHash
            }
            const changeTypeAccount = (type: string) => {
                if(phase.value === 3) {
                    phase.value++
                }
                typeAccount.value = type
            }
            const next = () => {
                if(typeAccount.value === 'account') {
                    if(!authentication.userId) {
                        toast.error('Você escolheu a opção de criar com conta, então precisa logar')
                        return
                    }
                } else if(typeAccount.value === 'no-account') {
                    signOut(auth).then(() => {
                        authentication.setUserId('')
                        authentication.setUser({})
                    }).catch((error) => {
                        console.log(error)
                        toast.error('Erro ao sair da conta')
                    })
                }
                let barber = barbers.value.filter((barber: any) => {
                    if(barber.id === barberSelected.value) {
                        return true
                    }
                })
                data.setDataSchedule({
                    date: daySelected.value,
                    barber: barber[0],
                    isAccount: typeAccount.value === 'account' ? true : false
                })
                router.push('/criar-agendamento')
            }
            const closeDialogRegister = () => {
                isActiveRegister.value = false
            }
            const closeDialogLogin = () => {
                isActive.value = false
            }
            const openLogin = () => {
                if(isActive.value) {
                    isActiveRegister.value = false
                } else {
                    isActive.value = true
                }
            }
            const openRegister = () => {
                if(isActiveRegister.value) {
                    isActive.value = false
                } else {
                    isActiveRegister.value = true
                }
            }
            watch(daySelected, (newValew: any) => {
                if(newValew) {
                    if(phase.value === 1) {
                        phase.value++
                        getBarbers()
                    }
                }
            })
            watch(barberSelected, (newValew: any) => {
                if(newValew) {
                    if(phase.value === 2) {
                        phase.value++
                    }
                }
            })
            onMounted(() => {
                getInfo()
            })

            return {
                loading,
                config,
                daySelected,
                days,
                dateFormatted,
                phase,
                barbers,
                barberSelected,
                authentication,
                typeAccount,
                changeTypeAccount,
                next,
                isActive,
                isActiveRegister,
                password,
                email,
                createUser,
                loginUser,
                closeDialogRegister,
                closeDialogLogin,
                clearRegister,
                clearLogin,
                openLogin,
                openRegister,
                logout
            }
        }
    }
</script>

<template>
    <Login v-model="isActive" :is-active="isActive" :login-user="loginUser" :close-dialog-login="closeDialogLogin" :clear-login="clearLogin" :open-register="openRegister" />
    <Register v-model="isActiveRegister" :is-active-register="isActiveRegister" :create-user="createUser" :close-dialog-register="closeDialogRegister" :clear-register="clearRegister" :open-login="openLogin" />
    <main class="flex justify-center w-full py-6">
        <div class="container max-w-[600px] mx-auto p-2">
            <div v-if="!loading" class="grid grid-cols-1 shadow-lg rounded p-5 bg-white" style="border: 2px solid rgba(150, 150, 150, 0.1)">
                <div v-if="authentication.userId" class="col-span-1">
                    <div class="flex items-center">
                        <v-avatar :image="authentication.user.image_url" size="54" class="shadow"></v-avatar>
                    </div>
                </div>
                <div class="col-span-1 mt-2">
                    <h1 v-if="authentication.userId" class="mb-0 text-lg md:text-xl font-weight-500">Seja bem-vindo, <span class="text-xl md:text-2xl font-weight-600">{{ authentication.user.name }}</span></h1>
                    <h1 v-else class=" mb-0 text-lg md:text-xl font-weight-500">Seja bem-vindo!</h1>
                </div>
                <div class="col-span-1 mt-1">
                    <div class="flex flex-col md:flex-row items-start md:items-center">
                        <v-btn @click="logout()" color="red-darken-3" class="my-1" v-if="authentication.userId">Sair</v-btn>
                        <v-btn @click="isActive = true" color="indigo-darken-3" class="my-1" v-else>Entrar</v-btn>
                        <v-btn to="/agendamentos" color="blue-grey-darken-2" class="md:ml-2 my-1">Ver agendamentos</v-btn>
                    </div>
                </div>
                <div class="col-span-1 mt-4">
                    <p class="mb-0 ">
                        Quer mudar o visual?
                    </p>
                    <p class="mb-0  mt-1">
                        Nós da <span class="font-weight-600">Barberia Bronxs</span> estamos aqui para te ajudar
                    </p>
                </div>
                <div class="col-span-1 mt-4">
                    <div class="grid grid-cols-1">
                        <div class="col-span-1">
                            <div class="flex flex-col">
                                <div class="flex items-center ">
                                    <div class="flex items-center mr-2">
                                        <span class="font-weight-600 mr-1">1</span>
                                        <v-icon>mdi-arrow-right-thin</v-icon>
                                    </div>
                                    <span>Primeiro escolha um dos dia para agendar:</span>
                                </div>
                                <div class="flex items-center mt-2">
                                    <v-btn-toggle
                                        v-model="daySelected"
                                        rounded="0"
                                        color="indigo-darken-3"
                                        group
                                        class="rounded"
                                    >
                                        <template v-for="(day, indice) in days" :key="indice">
                                            <v-btn :value="day" style="background-color: rgba(64, 64, 64, .9); color: white;" :style="indice < days.length - 1 ? `border-right: 1px solid rgba(64, 64, 64, .8);` : ``">
                                                {{ dateFormatted(day) }}
                                            </v-btn>
                                        </template>
                                    </v-btn-toggle>
                                </div>
                            </div>
                        </div>
                        <div v-if="phase > 1" class="col-span-1 mt-3">
                            <div class="flex flex-col">
                                <div class="flex items-center ">
                                    <div class="flex items-center mr-2">
                                        <span class="font-weight-600 mr-1">2</span>
                                        <v-icon>mdi-arrow-right-thin</v-icon>
                                    </div>
                                    <span>Agora escolha um dos barbeiros:</span>
                                </div>
                                <div v-if="barbers.length > 0" class="flex items-center mt-2">
                                    <v-btn-toggle
                                        v-model="barberSelected"
                                        rounded="0"
                                        color="indigo-darken-3"
                                        group
                                        class="rounded"
                                    >
                                        <template v-for="(barber, indice) in barbers" :key="indice">
                                            <v-btn :value="barber.id" style="background-color: rgba(64, 64, 64, .9); color: white;" :style="indice < days.length - 1 ? `border-right: 1px solid rgba(64, 64, 64, .8);` : ``">
                                                {{ barber.name }}
                                            </v-btn>
                                        </template>
                                    </v-btn-toggle>
                                </div>
                                <div v-else class="col-span-1 mt-4">
                                    <MasterNoResult title="Não tem barbeiros" padding="p-1" />
                                </div>
                            </div>
                        </div>
                        <div v-if="phase > 2" class="col-span-1 mt-3">
                            <div class="flex flex-col">
                                <div class="flex items-center ">
                                    <div class="flex items-center mr-2">
                                        <span class="font-weight-600 mr-1">3</span>
                                        <v-icon>mdi-arrow-right-thin</v-icon>
                                    </div>
                                    <span>Escolha se quer agendar com uma conta ou não:</span>
                                </div>
                                <div class="flex flex-col mt-2">
                                    <div>
                                        <button @click="changeTypeAccount('no-account')" class="shadow py-1 px-3 rounded text-sm font-weight-500" :style="typeAccount === 'no-account' ? `background: rgba(64, 64, 64, 1); color: white; border: 1px solid rgba(64, 64, 64, 1);` : `background: white; color: rgba(64, 64, 64, 1); border: 1px solid rgba(64, 64, 64, 1);`">Não quero agendar com uma conta</button>
                                    </div>
                                    <div class="mt-2">
                                        <button @click="changeTypeAccount('account')" class="shadow py-1 px-3 rounded text-sm font-weight-500" :style="typeAccount === 'account' ? `background: rgba(64, 64, 64, 1); color: white; border: 1px solid rgba(64, 64, 64, 1);` : `background: white; color: rgba(64, 64, 64, 1); border: 1px solid rgba(64, 64, 64, 1);`">{{ user ? `Quero agendar com a minha conta` : `Quero agendar com uma conta` }}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-if="phase > 3" class="col-span-1 mt-3">
                            <div class="flex flex-col">
                                <div class="flex items-center ">
                                    <div class="flex items-center mr-2">
                                        <span class="font-weight-600 mr-1">4</span>
                                        <v-icon>mdi-arrow-right-thin</v-icon>
                                    </div>
                                    <span>Prossiga para o agendamento:</span>
                                </div>
                                <div class="flex items-center mt-2">
                                    <v-btn @click="next()" color="green-darken-1">Agendar</v-btn>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>
<style lang="scss" scoped></style>
