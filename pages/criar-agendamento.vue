<script lang="ts">
    // fazer a autenticação com o firebase
    import { getAuth, signInWithCustomToken, signOut } from "firebase/auth";
    // para mexer com o banco de dados firestore do firebase
    import { collection, getDocs, query, where, doc, getDoc, Timestamp, updateDoc, orderBy, addDoc, limit, getCountFromServer } from 'firebase/firestore';
    // para usar os cards de notificações
    import { useToast } from 'vue-toastification';
    // para usar o firebase
    import { useFirebase } from '@/composables/useFirebase';
    // é o store responsável por gerenciar o que vai ser exibido
    import { useData } from '@/stores/data';
    import { addDays, format } from 'date-fns';
    import { useAuthentication } from '@/stores/authentication';

    export default {
        setup() {
            const data: any = useData()
            const authentication: any = useAuthentication()
            // para mexer com as tags heads
            useHead({
                title: `Login do Painel Administrativo (indicaPix)`,
                meta: [
                {
                    name: 'description',
                    content: 'Faça login no painel administrativo da IndicaPix, a empresa que conecta empresas e embaixadores para criar leads de alta qualidade.'
                }
                ]
            })
            // usando o firestore do firebase
            const { firestore } = useFirebase()
            const router = useRouter()
            const toast = useToast()
            const config = ref<any>()
            const loading = ref<boolean>(true)
            const hourSchedule = ref<any>({})
            const times = ref<any>([])
            const hairstyles = ref<any>([])
            const hairstylesSelected = ref<any>([])
            const hairstyleSelected = ref<any>({})
            const date = ref<any>(new Date())
            const isActive = ref<boolean>(false)
            const isActiveCode = ref<boolean>(false)
            const isActiveHairStyles = ref<boolean>(false)
            const isActiveSchedule = ref<boolean>(false)
            const timeSelected = ref<any>()
            const timesSelected = ref<any>([])
            const timesSelectedAfterHairstyle = ref<any>([])
            const countsSelected = ref<any>([])

            const name = ref<any>(null)

            const getInfo = async () => {
                const docRef = doc(firestore, "Info", "config"); // Referência ao documento "config"
                const docSnapshot = await getDoc(docRef); // Obtém o snapshot do documento

                if (docSnapshot.exists()) {
                    const configData = docSnapshot.data(); // Dados do documento
                    config.value = configData
                    loading.value = false
                }
            }

            const fetchHairstyles = async () => {
                let q: any
                q = query(collection(firestore, "Hairstyles"), orderBy("created_at", "desc"));
                const snapshot = await getCountFromServer(q);
                const total = snapshot.data().count;
                q = query(q, limit(30))
                const querySnapshot = await getDocs(q);
                const hairstylesDoc: any = []
                querySnapshot.forEach((doc: any) => {
                    hairstylesDoc.push({
                        id: doc.id,
                        ...doc.data()
                    })
                });
                if(hairstylesDoc.length > 0) {
                    hairstyles.value = hairstylesDoc
                }
                console.log(hairstyles.value)
                loading.value = false
            }
            const getCounters = (times: any, order: any) => {
                let novo = 0
                let count = 1
                let counts: any = [order]
                while(novo < 5) {
                    novo++
                    order++
                    let stop = 0
                    times.forEach((time: any, indice: any) => {
                        //console.log(`${Number(time)} - ${order}`)
                        if(Number(time) === order) {
                            count++
                            stop++
                            counts.push(time)
                        }
                    })
                    if(stop === 0) {
                        novo = 10
                    }
                }
                return {
                    count,
                    counts
                }
            }
            const getHours = async () => {
                let dateSplit = data.data_schedule.date.split("/")
                let dateFormatted = dateSplit[0] + '-' + dateSplit[1]
                const q = query(collection(firestore, "Days"), where("date", "==", dateFormatted), where("barber_id", "==", data.data_schedule.barber.id));
                const querySnapshot = await getDocs(q);
                let hourSchedulesDoc: any = []
                querySnapshot.forEach((doc: any) => {
                    hourSchedulesDoc.push({
                        id: doc.id,
                        ...doc.data()
                    })
                });
                console.log('kkkk')
                console.log(hourSchedulesDoc)
                if(hourSchedulesDoc.length > 0) {
                    hourSchedule.value = hourSchedulesDoc[0]
                    getTimes()
                }

                loading.value = false
            }
            const getTimes = async () => {
                console.log(hourSchedule.value)
                const q = query(collection(firestore, "Days", hourSchedule.value.id, "times"), orderBy("created_at", "asc"));
                const querySnapshot = await getDocs(q);
                times.value = []
                querySnapshot.forEach((doc: any) => {
                    times.value.push({
                        id: doc.id,
                        ...doc.data()
                    })
                });
                //console.log(times.value)
            }
            const getHairstyles = () => {
                let array: any = []
                let arrayHairStyles: any = []
                let counts: any = getCounters(hourSchedule.value.times_active, timeSelected.value.order)
                //console.log(counts)
                counts.counts.forEach((count: any) => {
                    times.value.forEach((time: any) => {
                        if(time.order === count) {
                            array.push(time)
                        }
                    })
                })
                //console.log(array)
                //countsSelected.value = counts.counts
                hairstyles.value.forEach((hairstyle: any) => {
                    //console.log(`${hairstyle.order} - ${counts.count}`)
                    if(hairstyle.order <= counts.count) {
                        arrayHairStyles.push(hairstyle)
                    }
                })
                //console.log(arrayHairStyles)
                // pega os dias que estão disponíveis em no máximo 6
                timesSelected.value = array
                // pega os cortes de cabelos que conseguem serem agendados com os dis disponíveis
                hairstylesSelected.value = arrayHairStyles
                isActiveHairStyles.value = true
            }
            const scheduleHour = async() => {
                let dateTimestamp = Timestamp.fromDate(new Date())
                let code = generateCode(7)
                if(data.data_schedule.isAccount) {
                    try {
                        const timesIds: any = []
                        timesSelectedAfterHairstyle.value.forEach(async (time: any, indice: any) => {
                            timesIds.push(time.id)
                            const timeDocRef = doc(firestore, "Days", hourSchedule.value.id, "times", time.id);
                            await updateDoc(timeDocRef, {
                                is_scheduled: true,
                                scheduled_at: dateTimestamp,
                                user_id: authentication.userId,
                                user_name: authentication.user.name,
                                updated_at: dateTimestamp,
                            });
                        })
                        const newTimes = hourSchedule.value.times_active.filter((count: any) => !countsSelected.value.includes(count));
                        const dayDocRef = doc(firestore, "Days", hourSchedule.value.id);
                        await updateDoc(dayDocRef, {
                            times_active: newTimes,
                            updated_at: dateTimestamp,
                        });
                        let month = Number(hourSchedule.value.month) - 1
                        let hour = timesSelectedAfterHairstyle.value[0].hour_start.slice(0, 2)
                        let dateTimestampScheduled = Timestamp.fromDate(new Date(hourSchedule.value.year, month, hourSchedule.value.day, hour, 0, 0))
                        const scheduleDocRef = await addDoc(collection(firestore, "Schedules"), {
                            name: `${timesSelectedAfterHairstyle.value[0].hour_start} - ${timesSelectedAfterHairstyle.value[timesSelectedAfterHairstyle.value.length - 1].hour_end}`,
                            duration: `${hairstyleSelected.value.order * 30} minutos`,
                            hour: `${timesSelectedAfterHairstyle.value[0].hour_start} - ${timesSelectedAfterHairstyle.value[timesSelectedAfterHairstyle.value.length - 1].hour_end}`,
                            date: hourSchedule.value.date,
                            user_id: authentication.userId,
                            user_name: authentication.user.name,
                            anomymous_code: null,
                            anomymous_code_id: null,
                            hour_start: timesSelectedAfterHairstyle.value[0].hour_start,
                            hour_end: timesSelectedAfterHairstyle.value[timesSelectedAfterHairstyle.value.length - 1].hour_end,
                            is_active: true,
                            is_cancelled: false,
                            cancelled_at: '',
                            created_at: dateTimestamp,
                            updated_at: dateTimestamp,
                            scheduled_at: dateTimestampScheduled,
                            count: hairstyleSelected.value.order,
                            counts: countsSelected.value,
                            times_ids: timesIds,
                            day_id: hourSchedule.value.id,
                            barber_id: hourSchedule.value.barber_id,
                            barber_name: hourSchedule.value.barber_name
                        })
                        if(scheduleDocRef) {
                            timesSelectedAfterHairstyle.value.forEach(async (time: any, indice: any) => {
                                const timeDocRef = doc(firestore, "Days", hourSchedule.value.id, "times", time.id);
                                await updateDoc(timeDocRef, {
                                    schedule_id: scheduleDocRef.id
                                });
                            })
                            toast.success("Agendado com sucesso!");
                            router.push('/agendamentos')
                        }
                    } catch (error) {
                        console.error("Erro ao agendar o documento:", error);
                        toast.error("Erro ao agendar!")
                    }
                } else {
                    try {
                        if(!name.value) {
                            toast.error('É preciso digitar um nome para identificação')
                            return
                        }
                        let isContinue = false
                        while(!isContinue) {
                            const q = query(collection(firestore, "Code_Schedules"), where("code", "==", code));
                            const querySnapshot = await getDocs(q);
                            let codesDoc: any = []
                            querySnapshot.forEach((doc: any) => {
                                codesDoc.push({
                                    id: doc.id,
                                    ...doc.data()
                                })
                            });
                            if(codesDoc.length > 0) {
                                code = generateCode(7)
                            } else {
                                isContinue = true
                            }
                        }
                        const codeDocRef = await addDoc(collection(firestore, "Code_Schedule"), {
                            code: code,
                            user_name: name.value,
                            created_at: dateTimestamp,
                            is_active: true,
                            schedule_id: hourSchedule.value.id,
                            schedule_hour_id: timeSelected.value.id
                        })
                        if(codeDocRef) {
                            ///////
                            const timesIds: any = []
                            timesSelectedAfterHairstyle.value.forEach(async (time: any, indice: any) => {
                                timesIds.push(time.id)
                                const timeDocRef = doc(firestore, "Days", hourSchedule.value.id, "times", time.id);
                                await updateDoc(timeDocRef, {
                                    is_scheduled: true,
                                    user_name: name.value,
                                    scheduled_at: dateTimestamp,
                                    anomymous_code: code,
                                    anomymous_code_id: codeDocRef.id,
                                    updated_at: dateTimestamp,
                                });
                            })
                            const newTimes = hourSchedule.value.times_active.filter((count: any) => !timesSelectedAfterHairstyle.value.includes(count));
                            const dayDocRef = doc(firestore, "Days", hourSchedule.value.id);
                            await updateDoc(dayDocRef, {
                                times_active: newTimes,
                                updated_at: dateTimestamp,
                            });
                            let month = Number(hourSchedule.value.month) - 1
                            let hour = timesSelectedAfterHairstyle.value[0].hour_start.slice(0, 2)
                            let dateTimestampScheduled = Timestamp.fromDate(new Date(hourSchedule.value.year, month, hourSchedule.value.day, hour, 0, 0))
                            const scheduleDocRef = await addDoc(collection(firestore, "Schedules"), {
                                name: `${timesSelectedAfterHairstyle.value[0].hour_start} - ${timesSelectedAfterHairstyle.value[timesSelectedAfterHairstyle.value.length - 1].hour_end}`,
                                duration: `${hairstyleSelected.value.order * 30} minutos`,
                                hour: `${timesSelectedAfterHairstyle.value[0].hour_start} - ${timesSelectedAfterHairstyle.value[timesSelectedAfterHairstyle.value.length - 1].hour_end}`,
                                date: hourSchedule.value.date,
                                user_id: null,
                                user_name: name.value,
                                anomymous_code: code,
                                anomymous_code_id: codeDocRef.id,
                                hour_start: timesSelectedAfterHairstyle.value[0].hour_start,
                                hour_end: timesSelectedAfterHairstyle.value[timesSelectedAfterHairstyle.value.length - 1].hour_end,
                                is_active: true,
                                is_cancelled: false,
                                cancelled_at: '',
                                created_at: dateTimestamp,
                                updated_at: dateTimestamp,
                                scheduled_at: dateTimestampScheduled,
                                count: hairstyleSelected.value.order,
                                counts: countsSelected.value,
                                times_ids: timesIds,
                                day_id: hourSchedule.value.id,
                                barber_id: hourSchedule.value.barber_id,
                                barber_name: hourSchedule.value.barber_name
                            })
                            timesSelectedAfterHairstyle.value.forEach(async (time: any, indice: any) => {
                                const timeDocRef = doc(firestore, "Days", hourSchedule.value.id, "times", time.id);
                                await updateDoc(timeDocRef, {
                                    schedule_id: scheduleDocRef.id
                                });
                            })
                            //////
                            data.setAnomynousCode(code)
                            isActiveCode.value = true
                        } else {
                            toast.error('Erro ao criar o código')
                        }
                    } catch (error) {
                        console.error("Erro ao agendar o documento:", error);
                        toast.error("Erro ao agendar!")
                    }
                }
            }
            const nextCode = () => {
                isActiveCode.value = false
                toast.success("Agendado com sucesso!");
                router.push('/agendamentos')
            }
            const nextHairstyle = (hairstyle: any) => {
                hairstyleSelected.value = hairstyle
                timesSelected.value.forEach((time: any, indice: any) => {
                    if(Number(indice) < hairstyle.order) {
                        timesSelectedAfterHairstyle.value.push(time)
                        countsSelected.value.push(time.order)
                    }
                })
                isActiveSchedule.value = true
            }
            const isAvaliableHour = (hourStart: any, year: any, month: any, day: any) => {
                const currentDate = new Date();
                const scheduleDate = new Date(`${year}-${month}-${day} ${hourStart}:00`);
                if (scheduleDate > currentDate) {
                    return true
                } else {
                    return false
                }
            }
            const isAvaliableDay = (year: any, month: any, day: any) => {
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                const scheduleDate = new Date(year, (Number(month) -1), day);
                if (scheduleDate >= currentDate) {
                    return true
                } else {
                    return false
                }
            }
            const generateCode = (numberOf: number): string => {
                const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                let code
                code = uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];
                for(let i = 0; i < numberOf; i++) {
                    code += Math.floor(Math.random() * 10)
                }
                code += uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];
                return code
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
                timeSelected.value = hour
                isActive.value = true
            }
            const dateFormatted = (date: any) => {
                let dateSplit = date.split("/")
                let newDate = dateSplit[0] + '/' + dateSplit[1]
                return newDate
            }
            const closeDialogHairstyles = () => {
                isActiveHairStyles.value = false
            }
            const closeDialogSchedule = () => {
                isActiveSchedule.value = false
            }

            onMounted(() => {
                if(data.data_schedule && data.data_schedule.date) {
                    getHours()
                    fetchHairstyles()
                    getInfo()
                } else {
                    router.push('/')
                }
            })

            return {
                loading,
                config,
                dateFormatted,
                data,
                hourSchedule,
                authentication,
                times,
                date,
                isAvaliableHour,
                isAvaliableDay,
                isActive,
                openDialog,
                timeSelected,
                convertDateFirestore,
                scheduleHour,
                name,
                isActiveCode,
                nextCode,
                getCounters,
                isActiveHairStyles,
                hairstylesSelected,
                timesSelected,
                getHairstyles,
                closeDialogHairstyles,
                isActiveSchedule,
                nextHairstyle,
                hairstyleSelected,
                timesSelectedAfterHairstyle,
                closeDialogSchedule
            }
        }
    }
</script>

<template>
    <v-dialog width="600" v-model="isActiveCode">
    <template v-slot:default="{ isActiveCode }">
        <v-card title="Copie o código de agendamento">
        <v-card-text>
            <div class="grid grid-cols-1">
                <div class="col-span-1 mt-2">
                    <div class="flex flex-col items-center">
                        <span class="text-xl font-weight-600 bg-neutral-200 shadow-lg p-1">{{ data.anomymous_code }}</span>
                        <span class="mt-3">Guarde-o bem, pois ele será usado para pesquisar os teus agendamentos. Caso não sinta-se bem em usar códigos,
                            então é preferível que crie uma conta. É rápido, simples e fácil.
                        </span>
                    </div>
                </div>
            </div>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                class="text-none"
                color="red-darken-4"
                variant="flat"
                @click="nextCode()"
            >
                Fechar
            </v-btn>
        </v-card-actions>
        </v-card>
    </template>
    </v-dialog>
    <v-dialog width="600" v-model="isActiveSchedule">
    <template v-slot:default="{ isActiveSchedule }">
        <v-card title="Confira os dados do agendamento">
        <v-card-text>
            <div class="grid grid-cols-1">
                <div class="col-span-1 mt-2">
                    <div class="flex flex-col">
                        <div class="flex flex-col mt-1">
                            <span class="font-weight-600 mr-2">Corte de cabelo:</span>
                            <div class="flex items-center mt-1">
                                <v-avatar :image="hairstyleSelected.image_url" size="44" rounded="sm"></v-avatar>
                                <span class="ml-2 font-weight-400 text-[1rem]">{{ hairstyleSelected.name }}</span>
                            </div>
                        </div>
                        <div class="flex items-center mt-1">
                            <span class="font-weight-500 mr-2">Horário inicial:</span>
                            <span class="font-weight-400 text-[1rem]">{{ timesSelectedAfterHairstyle[0].hour_start }}</span>
                        </div>
                        <div class="flex items-center mt-1">
                            <span class="font-weight-500 mr-2">Horário final:</span>
                            <span class="font-weight-400 text-[1rem]">{{ timesSelectedAfterHairstyle[timesSelectedAfterHairstyle.length - 1].hour_end }}</span>
                        </div>
                        <div class="flex items-center mt-1">
                            <span class="font-weight-500 mr-2">Intervalo:</span>
                            <span class="font-weight-400 text-[1rem]">{{ timesSelectedAfterHairstyle[0].hour_start }} - {{ timesSelectedAfterHairstyle[timesSelectedAfterHairstyle.length - 1].hour_end }}</span>
                        </div>
                        <div class="flex items-center mt-1">
                            <span class="font-weight-500 mr-2">Data:</span>
                            <span class="font-weight-400 text-[1rem]">{{ hourSchedule.date }}</span>
                        </div>
                        <div class="flex items-center mt-1">
                            <span class="font-weight-500 mr-2">Barbeiro:</span>
                            <span class="font-weight-400 text-[1rem]">{{ hourSchedule.barber_name }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-span-1 mt-2">
                    <span>Se os dados estão corretos, então continue com o agendamento</span>
                </div>
            </div>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                class="text-none"
                color="green-darken-4"
                variant="flat"
                @click="scheduleHour()"
            >
                Agendar
            </v-btn>
            <v-btn
                class="text-none"
                color="red-darken-4"
                variant="flat"
                @click="closeDialogSchedule()"
            >
                Fechar
            </v-btn>
        </v-card-actions>
        </v-card>
    </template>
    </v-dialog>
    <v-dialog width="600" v-model="isActiveHairStyles">
    <template v-slot:default="{ isActiveHairStyles }">
        <v-card title="Escolha um corte de cabelo">
        <v-card-text>
            <div class="grid grid-cols-1">
                <div v-if="hairstylesSelected.length > 0" class="col-span-1 overflow-x-hidden overflor-y-auto max-h-[200px] p-1">
                    <div class="grid grid-cols-1 gap-1">
                        <template v-for="(hairstyle, indice) in hairstylesSelected">
                            <div @click="nextHairstyle(hairstyle)" tabindex="0" class="cursor-pointer col-span-1 mt-2 bg-neutral-100 shadow p-2 rounded">
                                <div class="flex items-center">
                                    <v-avatar :image="hairstyle.image_url" size="50" rounded="sm"></v-avatar>
                                    <span class="ml-2">{{ hairstyle.name }}</span>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
                <div v-else class="col-span-1">
                    <span>Não tem cortes de cabelo disponíveis</span>
                </div>
            </div>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                class="text-none"
                color="red-darken-4"
                variant="flat"
                @click="closeDialogHairstyles()"
            >
                Fechar
            </v-btn>
        </v-card-actions>
        </v-card>
    </template>
    </v-dialog>
    <v-dialog width="600" v-model="isActive">
    <template v-slot:default="{ isActive }">
        <v-card :title="timeSelected.name" subtitle="Intervalo">
        <v-card-text>
            <div class="grid grid-cols-1">
                <div v-if="!timeSelected.is_open" class="col-span-1 mt-2">
                    <div class="flex flex-col items-start">
                        <div class="flex items-center bg-neutral-800 text-white justify-center px-3 py-1 rounded">
                            <span class="font-weight-600">Está fechado</span>
                        </div>
                    </div>
                </div>
                <div v-else-if="!authentication.userId" class="col-span-1 mt-2">
                    <div class="flex flex-col">
                        <v-text-field
                            v-model="name"
                            :counter="30"
                            label="Digite um nome para identificação"
                            bg-color="#dcdcdc"
                            class="p-1"
                            maxlenght="30"
                        ></v-text-field>
                    </div>
                </div>
                <div class="col-span-1 mt-2">
                    <div class="flex flex-col items-start">
                        <div class="flex items-center">
                            <span class="font-weight-600 mr-2">Minutos:</span>
                            <span>{{ timeSelected.minutes }}</span>
                        </div>
                        <!--<div class="flex items-center">
                            <span class="font-weight-600 mr-2">Contadores:</span>
                            <span>{{ getCounters(hourSchedule.times_active, timeSelected.order) }}</span>
                        </div>-->
                        <div v-if="timeSelected.updated_at" class="flex items-center mt-1">
                            <span class="font-weight-600 mr-2">Última atualização:</span>
                            <span>{{ convertDateFirestore(timeSelected.updated_at) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                v-if="!timeSelected.is_scheduled && timeSelected.is_open"
                class="text-none"
                color="green-darken-4"
                variant="flat"
                @click="getHairstyles()"
            >
                Prosseguir
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
                <div class="col-span-1 mt-4">
                    <div class="grid grid-cols-1">
                        <div class="col-span-1 mt-2">
                            <div class="flex flex-col">
                                <div class="flex items-center">
                                    <span class="text-[0.9rem] font-weight-400 mr-1">Barbeiro:</span>
                                    <span class="font-weight-500">{{ hourSchedule.barber_name }}</span>
                                </div>
                                <div class="flex items-center">
                                    <span class="text-[0.8rem] font-weight-400 mr-1">Dia:</span>
                                    <span class="font-weight-500">{{ hourSchedule.day }}</span>
                                </div>
                                <div class="flex items-center">
                                    <span class="text-[0.8rem] font-weight-400 mr-1">Mês:</span>
                                    <span class="font-weight-500">{{ hourSchedule.month_formatted }}</span>
                                </div>
                                <div class="flex items-center">
                                    <span class="text-[0.8rem] font-weight-400 mr-1">Duração:</span>
                                    <span class="font-weight-500">{{ hourSchedule.duration_formatted }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-span-1 mt-2">
                            <div class="grid grid-cols-1">
                                <div class="col-span-1">
                                    <div class="flex flex-col">
                                        <span class="text-lg font-weight-500">Horários:</span>
                                        <div class="flex lg:items-center flex-col lg:flex-row">
                                            <div class="flex items-center lg:mr-2 mt-2">
                                                <div class="w-[12px] h-[12px] rounded bg-green-300 hover:bg-green-600 mr-1"></div>
                                                <span class="text-[0.75rem]">Está agendado</span>
                                            </div>
                                            <div class="flex items-center lg:mr-2 mt-2">
                                                <div class="w-[12px] h-[12px] rounded bg-gray-300 hover:bg-gray-600 mr-1"></div>
                                                <span class="text-[0.75rem]">Não está agendado</span>
                                            </div>
                                            <div class="flex items-center mt-2">
                                                <div class="w-[12px] h-[12px] rounded mr-1" style="background-color: rgba(150, 17, 17, 0.3);"></div>
                                                <span class="text-[0.75rem]">Não está disponível</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="times.length > 0" class="col-span-1 mt-1">
                                    <v-list
                                        lines="one"
                                        density="compact"
                                        class="grid grid-cols-12 gap-4"
                                    >
                                        <template v-for="(time, i) in times" :key="i">
                                        <v-list-item
                                            v-if="!time.is_scheduled && time.is_active && !time.is_cancelled"
                                            :disabled="isAvaliableHour(time.hour_start, hourSchedule.year, hourSchedule.month, hourSchedule.day) ? false : true"
                                            :value="time"
                                            class="col-span-12 md:col-span-6"
                                            style="padding: 0;"
                                            @click="openDialog(time)"
                                        >
                                            <!-- Conteúdo completo do v-list-item -->
                                            <template v-slot:default>
                                                <!-- Personalize o conteúdo do item aqui -->
                                                <div :class="time.is_scheduled ? `bg-green-200 hover:bg-green-500 hover:text-white` : `bg-gray-200 hover:bg-gray-500 hover:text-white`" class="w-full h-full p-2 rounded shadow flex items-center justify-between" :style="isAvaliableHour(time.hour_start, hourSchedule.year, hourSchedule.month, hourSchedule.day) ? `` : `background-color: rgba(150, 17, 17, 0.3) !important;`">
                                                    <div class="flex items-center">
                                                        <div v-if="time.is_active" class="mr-2">
                                                            <Icon name="ic:baseline-alarm" class="text-sm sm:text-base lg:text-lg" />
                                                            <v-tooltip text="Ativo" activator="parent" location="top" />
                                                        </div>
                                                        <div v-else class="mr-2">
                                                            <Icon name="ic:baseline-alarm-off" class="text-sm sm:text-base lg:text-lg" />
                                                            <v-tooltip text="Desativado" activator="parent" location="top" />
                                                        </div>
                                                        <span class="text-sm">{{ time.hour_start }}</span>
                                                    </div>
                                                    <div v-if="time.is_cancelled || !time.is_open" class="flex md:items-center">
                                                        <div v-if="time.is_cancelled">
                                                            <Icon name="mdi:cancel" class="text-sm sm:text-base lg:text-lg" />
                                                            <v-tooltip text="Cancelado" activator="parent" location="top" />
                                                        </div>
                                                        <div v-if="!time.is_open" class="mx-1">
                                                            <Icon name="mdi:close-circle" class="text-sm sm:text-base lg:text-lg" />
                                                            <v-tooltip text="Fechado" activator="parent" location="top" />
                                                        </div>
                                                    </div>
                                                <!-- Adicione mais elementos conforme necessário -->
                                                </div>
                                            </template>
                                        </v-list-item>
                                        </template>
                                    </v-list>
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
            </div>
        </div>
    </main>
</template>
<style lang="scss" scoped></style>