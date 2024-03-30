<script lang="ts">
    import { getAuth, signInWithCustomToken, signOut } from "firebase/auth";
    import { collection, getDocs, query, where, doc, getDoc, Timestamp, updateDoc, addDoc, orderBy, arrayUnion } from 'firebase/firestore';
    import { useToast } from 'vue-toastification';
    import { useFirebase } from '../composables/useFirebase';
    import { useData } from '../stores/data';
    import { useAuthentication } from '../stores/authentication';
    import CryptoJS from 'crypto-js';
    import { useCreate } from '../composables/createFirebase';
    import { useShow } from '../stores/show';

    export default {
        setup() {
            const data: any = useData()
            const authentication: any = useAuthentication()
            const show = useShow()
            // para mexer com as tags heads
            useHead({
                title: `Agendamentos - Barberia do Bronxs`,
                meta: [
                {
                    name: 'description',
                    content: 'Encontre os teus agendamentos, seja por meio da sua conta ou por meio do código'
                }
                ]
            })
            // usando o firestore do firebase
            const { firestore, auth } = useFirebase()
            const { addInteraction, addWarning } = useCreate()
            const router = useRouter()
            const toast = useToast()
            const config = ref<any>()
            const loading = ref<boolean>(true)
            const schedules = ref<any>([])
            const date = ref<any>(new Date())
            const params = new URLSearchParams();
            const secretKeyAuth = useRuntimeConfig().public.SECRET_KEY_AUTH
            const salt = useRuntimeConfig().public.SALT
            const isActive = ref<boolean>(false)
            const isActiveLogin = ref<boolean>(false)
            const isActiveRegister = ref<boolean>(false)
            const hourSelected = ref<any>()
            const anomymousCode = ref<any>(null)
            const clearRegister = ref<any>(false)
            const clearLogin = ref<any>(false)
            const loadedSchedules = ref<boolean>(false)
            const userId = ref<any>(null)

            const getInfo = async () => {
                const docRef = doc(firestore, "Info", "config"); // Referência ao documento "config"
                const docSnapshot = await getDoc(docRef); // Obtém o snapshot do documento

                if (docSnapshot.exists()) {
                    const configData = docSnapshot.data(); // Dados do documento
                    config.value = configData
                    loading.value = false
                }
            }
            const getSchedules = async () => {
                let q = query(collection(firestore, "Schedules"));
                let date = new Date()
                if(authentication.userId) {
                    q = query(q, where("user_id", "==", authentication.userId), where("scheduled_at", ">", date), orderBy("scheduled_at", "asc"));
                } else {
                    q = query(q, where("anomymous_code", "==", anomymousCode.value), where("scheduled_at", ">", date), orderBy("scheduled_at", "asc"));
                }
                const querySnapshot = await getDocs(q);
                let schedulesDoc: any = []
                querySnapshot.forEach((doc: any) => {
                    schedulesDoc.push({
                        id: doc.id,
                        ...doc.data()
                    })
                });
                if(schedulesDoc.length > 0) {
                    schedules.value = schedulesDoc
                    if(!authentication.userId) {
                        data.setAnomynousCode(anomymousCode.value)
                    }
                } else {
                    if(!authentication.userId) {
                        data.setAnomynousCode(null)
                    }
                }
                loadedSchedules.value = true
                loading.value = false
            }
            const cancelledSchedule = async() => {
                show.setIsLoadingGlobal(true)
                let dateTimestamp = Timestamp.fromDate(new Date())
                try {
                    hourSelected.value.times_ids.forEach(async (time: any, indice: any) => {
                        const timeDocRef = doc(firestore, "Days", hourSelected.value.day_id, "times", time);
                        await updateDoc(timeDocRef, {
                            is_scheduled: false,
                            scheduled_at: '',
                            schedule_id: '',
                            user_id: '',
                            user_name: '',
                            anomymous_code: '',
                            anomymous_code_id: '',
                            updated_at: dateTimestamp,
                        });
                    })
                    const dayDocRef = doc(firestore, "Days", hourSelected.value.day_id);
                    await updateDoc(dayDocRef, {
                        times_active: arrayUnion(...hourSelected.value.counts),
                        updated_at: dateTimestamp,
                    });
                    const scheduleDocRef = doc(firestore, "Schedules", hourSelected.value.id);
                    await updateDoc(scheduleDocRef, {
                        is_cancelled: true,
                        cancelled_at: dateTimestamp,
                        updated_at: dateTimestamp
                    })
                    if(anomymousCode.value) {
                        const codeDocRef = doc(firestore, "Code_Schedule", anomymousCode.value);
                        const codeDocSnapshot = await getDoc(codeDocRef); // Obtém o snapshot do documento

                        if (codeDocSnapshot.exists()) {
                            addInteraction({
                                text: `A pessoa ${codeDocSnapshot.data().name} efetuou o cancelamento do agendamento: ${hourSelected.value.name} - ${hourSelected.value.date}`,
                                user_id: anomymousCode.value,
                                barber_id: "",
                                is_master: false,
                            })
                        }
                    } else {
                        addInteraction({
                            text: `O usuário ${authentication.user.name} efetuou o cancelamento do agendamento: ${hourSelected.value.name} - ${hourSelected.value.date}`,
                            user_id: authentication.userId,
                            barber_id: "",
                            is_master: false,
                        })
                    }
                    addWarning({
                        type: "update",
                        text: `O agendamento ${hourSelected.value.name} - ${hourSelected.value.date} foi cancelado pelo próprio autor`,
                        user_id: authentication.userId ? authentication.userId : anomymousCode.value,
                        barber_id: "",
                        is_master: false,
                    })
                    show.setIsLoadingGlobal(false)
                    toast.success("Cancelado com sucesso!");
                    getSchedules()
                    isActive.value = false
                } catch (error) {
                    show.setIsLoadingGlobal(false)
                    console.error("Erro ao cancelar o documento:", error);
                    toast.error("Erro ao cancelar!")
                }
            }
            const convertDateFirestore = (date: any) => {
                const newTimestamp = new Timestamp(date.seconds, date.nanoseconds)
                const newDate = newTimestamp.toDate()
                let result
                if(newDate.getDate()) {
                    let myDate = convertDate(newDate)
                    result = `${myDate.day}/${myDate.month}/${myDate.year} - ${myDate.hours}:${myDate.minutes}`
                } else {
                    result = '-'
                }
                return result
            }
            const openDialog = (hour: any) => {
                hourSelected.value = hour
                isActive.value = true
            }
            const dateFormatted = (date: any) => {
                let dateSplit = date.split("/")
                let newDate = dateSplit[0] + '/' + dateSplit[1]
                return newDate
            }
            const onClick = () => {
                getSchedules()
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
                    toast.success('Sucesso ao criar a conta')
                    let date = new Date()
                    generateTokenApi(name, userDoc.id, email, date).then(async (response) => {
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
                        generateTokenApi(authentication.user.name, authentication.user.id, authentication.user.email, date).then((response) => {
                            if(response.status) {
                                signInWithCustomToken(auth, response.token)
                                show.setIsLoadingGlobal(false)
                                toast.success('Sucesso ao logar')
                                clearLogin.value = true
                                isActiveLogin.value = false
                                getSchedules()
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
                show.setIsLoadingGlobal(true)
                signOut(auth).then(() => {
                    addInteraction({
                        text: `O usuário ${authentication.user.name} saiu da conta`,
                        user_id: authentication.userId,
                        barber_id: "",
                        is_master: false,
                    })
                    authentication.setUserId('')
                    authentication.setUser({})
                    show.setIsLoadingGlobal(false)
                    toast.success('Sucesso ao sair da conta')
                    loadedSchedules.value = false
                    schedules.value = []
                }).catch((error) => {
                    console.log(error)
                    show.setIsLoadingGlobal(false)
                    toast.error('Erro ao sair da conta')
                })
            }
            const generateTokenApi = async (userName: string, userId: string, userEmail: string, date: Date) => {
                let formdataApi = {
                    name: userName,
                    id: userId,
                    email: userEmail,
                    dateLogin: date,
                    keyAuth: secretKeyAuth
                }
                for (const [key, value] of Object.entries(formdataApi) as [string, any][]) {
                    params.append(key, value);
                }
                return await $fetch(`https://boot-whats-fcwv.onrender.com/token/custom-token-firebase`, {
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
            const closeDialogRegister = () => {
                isActiveRegister.value = false
            }
            const closeDialogLogin = () => {
                isActiveLogin.value = false
            }
            const openLogin = () => {
                if(isActiveLogin.value) {
                    isActiveRegister.value = false
                } else {
                    isActiveLogin.value = true
                }
            }
            const openRegister = () => {
                if(isActiveRegister.value) {
                    isActiveLogin.value = false
                } else {
                    isActiveRegister.value = true
                }
            }
            /*watch(authentication.userId, (newValew: any) => {
                if(newValew) {
                    getSchedules()
                }
            })*/
            onMounted(() => {
                if(data.anomymous_code || authentication.userId) {
                    anomymousCode.value = data.anomymous_code
                    getSchedules()
                }
                getInfo()
            })

            return {
                loading,
                config,
                data,
                authentication,
                schedules,
                dateFormatted,
                date,
                isActive,
                openDialog,
                hourSelected,
                convertDateFirestore,
                cancelledSchedule,
                anomymousCode,
                onClick,
                isActiveLogin,
                isActiveRegister,
                createUser,
                loginUser,
                closeDialogRegister,
                closeDialogLogin,
                clearRegister,
                clearLogin,
                openLogin,
                openRegister,
                loadedSchedules,
                logout
            }
        }
    }
</script>

<template>
    <Login v-model="isActiveLogin" :is-active="isActiveLogin" :login-user="loginUser" :close-dialog-login="closeDialogLogin" :clear-login="clearLogin" :open-register="openRegister" />
    <Register v-model="isActiveRegister" :is-active-register="isActiveRegister" :create-user="createUser" :close-dialog-register="closeDialogRegister" :clear-register="clearRegister" :open-login="openLogin" />
    <v-dialog width="600" v-model="isActive">
    <template v-slot:default="{ isActive }">
        <v-card :title="hourSelected.name" subtitle="Intervalo">
        <v-card-text>
            <div class="grid grid-cols-1">
                <div class="col-span-1 mt-2">
                    <div class="flex flex-col items-start">
                        <div v-if="hourSelected.is_cancelled" class="flex items-center bg-red-800 text-white justify-center px-3 py-1 rounded">
                            <span class="font-weight-600">Está cancelado</span>
                        </div>
                        <div v-else class="flex items-center bg-green-800 text-white justify-center px-3 py-1 rounded">
                            <span class="font-weight-600">Está agendado</span>
                        </div>
                        <div class="flex flex-col md:flex-row items-start md:items-center mt-1">
                            <span class="font-weight-600 mr-2">Cliente:</span>
                            <span class="text-lg">{{ hourSelected.user_name }}</span>
                        </div>
                        <div v-if="hourSelected.is_cancelled" class="flex flex-col md:flex-row items-start md:items-center mt-1">
                            <span class="font-weight-600 mr-2">Data de cancelamento:</span>
                            <span>{{ convertDateFirestore(hourSelected.scheduled_at) }}</span>
                        </div>
                        <div v-else class="flex flex-col md:flex-row items-start md:items-center mt-1">
                            <span class="font-weight-600 mr-2">Data de agendamento:</span>
                            <span>{{ convertDateFirestore(hourSelected.scheduled_at) }}</span>
                        </div>
                        <div class="flex flex-col md:flex-row items-start md:items-center mt-1">
                            <span class="font-weight-600 mr-2">Barbeiro:</span>
                            <span class="text-lg">{{ hourSelected.barber_name }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-span-1 mt-2">
                    <div class="flex flex-col items-start">
                        <div class="flex flex-col md:flex-row items-start md:items-center">
                            <span class="font-weight-600 mr-2">Data:</span>
                            <span>{{ hourSelected.date }}</span>
                        </div>
                        <div v-if="hourSelected.updated_at" class="flex flex-col md:flex-row items-start md:items-center mt-1">
                            <span class="font-weight-600 mr-2">Última atualização:</span>
                            <span>{{ convertDateFirestore(hourSelected.updated_at) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                class="text-none"
                color="orange-accent-4"
                variant="flat"
                @click="cancelledSchedule()"
            >
                Retirar agendamento
            </v-btn>
            <v-btn
                class="text-none"
                color="red-darken-4"
                variant="flat"
                @click="isActive.value = false"
            >
                Fechar
            </v-btn>
        </v-card-actions>
        </v-card>
    </template>
    </v-dialog>
    <main class="flex justify-center w-full py-6">
        <div class="container max-w-[600px] mx-auto p-2">
            <div v-if="!loading" class="grid grid-cols-1 shadow-lg rounded p-5 bg-white" style="border: 2px solid rgba(150, 150, 150, 0.1)">
                <div class="col-span-1">
                    <div v-if="authentication.userId" class="flex items-center">
                        <v-avatar :image="authentication.user.image_url" size="54" class="shadow"></v-avatar>
                        <h1 class="ml-2 mb-0 text-lg md:text-xl font-weight-500">{{ authentication.user.name }}</h1>
                    </div>
                    <div v-else class="flex items-center">
                        <h1 class="mb-0 text-lg md:text-xl font-weight-500 bg-gray-200 px-2 py-1 rounded">Está sem conta</h1>
                    </div>
                </div>
                <div class="col-span-1 mt-3">
                    <div class="grid grid-cols-1">
                        <div v-if="!authentication.userId" class="col-span-1 flex justify-center">
                            <v-text-field
                                v-model="anomymousCode"
                                label="Digite o código de agendamento"
                                bg-color="#dcdcdc"
                                class="p-1 max-w-[400px] text-sm"
                                maxlenght="8"
                                hide-details="auto"
                                @click:append-inner="onClick"
                                append-inner-icon="mdi-magnify"
                                density="compact"
                                clearable
                            ></v-text-field>
                        </div>
                        <div v-if="!authentication.userId" class="col-span-1 text-center">
                            <span class="font-weight-500 text-sm">Ou</span>
                        </div>
                        <div class="col-span-1 flex justify-center">
                            <v-btn v-if="authentication.userId" @click="logout()" color="red-darken-3">Sair</v-btn>
                            <v-btn v-else @click="isActiveLogin = true" color="indigo-darken-3">Entre em uma conta</v-btn>
                        </div>
                    </div>
                </div>
                <div class="col-span-1" :class="!data.anomymous_code && !authentication.userId ? `mt-4` : `mt-4`">
                    <div class="grid grid-cols-1">
                        <div class="col-span-1">
                            <div class="flex flex-items justify-center">
                                <span class="text-lg font-weight-500 bg-neutral-300 py-1 px-3 shadow rounded">Agendamentos</span>
                            </div>
                        </div>
                        <div v-if="schedules.length > 0" class="col-span-1 mt-4">
                            <v-list
                                lines="one"
                                density="compact"
                                class="grid grid-cols-12 gap-4"
                            >
                                <v-list-item
                                    v-for="(hour, i) in schedules"
                                    :key="i"
                                    :value="hour"
                                    class="col-span-12 md:col-span-6"
                                    style="padding: 0;"
                                    @click="openDialog(hour)"
                                >
                                    <!-- Conteúdo completo do v-list-item -->
                                    <template v-slot:default>
                                        <!-- Personalize o conteúdo do item aqui -->
                                        <div :class="hour.is_scheduled ? `bg-green-200 hover:bg-green-500 hover:text-white` : `bg-gray-200 hover:bg-gray-500 hover:text-white`" class="w-full h-full p-2 rounded shadow flex items-center justify-between" :style="hour.is_cancelled ? `background: rgba(220, 20, 20, 0.5);` : ``">
                                            <div class="flex items-center">
                                                <div v-if="hour.is_active" class="mr-2">
                                                    <Icon name="ic:baseline-alarm" class="text-sm sm:text-base lg:text-lg" />
                                                    <v-tooltip text="Ativo" activator="parent" location="top" />
                                                </div>
                                                <div v-else class="mr-2">
                                                    <Icon name="ic:baseline-alarm-off" class="text-sm sm:text-base lg:text-lg" />
                                                    <v-tooltip text="Desativado" activator="parent" location="top" />
                                                </div>
                                                <div class="flex items-center">
                                                    <span class="text-sm">{{ hour.name }}</span>
                                                    <Icon name="mdi:calendar-arrow-right" class="mx-2" />
                                                    <span class="text-sm">{{ hour.date }}</span>
                                                </div>
                                            </div>
                                            <div v-if="hour.is_cancelled" class="flex md:items-center">
                                                <div v-if="hour.is_cancelled">
                                                    <Icon name="mdi:cancel" class="text-sm sm:text-base lg:text-lg" />
                                                    <v-tooltip text="Cancelado" activator="parent" location="top" />
                                                </div>
                                            </div>
                                        <!-- Adicione mais elementos conforme necessário -->
                                        </div>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </div>
                        <div v-else-if="loadedSchedules" class="col-span-1 mt-4">
                            <MasterNoResult title="Não tem agendamentos" padding="p-1" />
                        </div>
                    </div>
                </div>
                <div class="col-span-1 mt-5">
                    <div class="flex justify-center items-center">
                        <NuxtLink to="/" class="px-4 py-1 rounded shadow no-underline bg-gray-800 text-white">Voltar</NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>
<style lang="scss" scoped></style>