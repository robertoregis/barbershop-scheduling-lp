<script lang="ts">
    import { getCountFromServer, getDocs, collection, query, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore'
    import { useFirebase } from '@/composables/useFirebase';
    import { convertDate } from '@/composables/date';
    import { useToast } from 'vue-toastification';

    export default {
        props: {
            schedule: {
                type: Object,
                required: true
            },
            month: {
                type: String,
                required: true
            },
            day: {
                type: String,
                required: true
            },
            year: {
                type: Number,
                required: true
            }
        },
        setup(props) {
            const schedule = toRef(props, 'schedule')
            const year = toRef(props, 'year')
            const month = toRef(props, 'month')
            const day = toRef(props, 'day')
            const { firestore } = useFirebase()
            const hours = ref<any>([])
            const date = ref<any>(new Date())
            const isActive = ref<boolean>(false)
            const hourSelected = ref<any>()
            const toast = useToast()

            const getHours = async () => {
                const q = query(collection(firestore, "Schedules", schedule.value.id, "hours"), orderBy("created_at", "asc"));
                const querySnapshot = await getDocs(q);
                hours.value = []
                querySnapshot.forEach((doc: any) => {
                    hours.value.push({
                        id: doc.id,
                        ...doc.data()
                    })
                });
            }
            const updateHour = async() => {
                let dateTimestamp = Timestamp.fromDate(new Date())
                const hourDocRef = doc(firestore, "Schedules", schedule.value.id, "hours", hourSelected.value.id);
                try {
                    await updateDoc(hourDocRef, {
                        ...hourSelected.value,
                        updated_at: dateTimestamp,
                    });
                    toast.success("Atualizado com sucesso!");
                    isActive.value = false
                } catch (error) {
                    console.error("Erro ao atualizar o documento:", error);
                    toast.error("Erro ao atualizar!")
                    isActive.value = false
                }
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
            onMounted(() => {
                getHours()
            })

            return {
                schedule,
                hours,
                date,
                isAvaliableHour,
                year,
                month,
                day,
                isAvaliableDay,
                isActive,
                openDialog,
                hourSelected,
                convertDateFirestore,
                updateHour
            }
        }
    }
</script>
<template>
    <v-dialog width="600" v-model="isActive">
    <template v-slot:default="{ isActive }">
        <v-card :title="hourSelected.name" subtitle="Intervalo">
        <v-card-text>
            <div class="grid grid-cols-1">
                <div v-if="hourSelected.is_scheduled" class="col-span-1 mt-2">
                    <div class="flex flex-col items-start">
                        <div class="flex items-center bg-green-800 text-white justify-center px-3 py-1 rounded">
                            <span class="font-weight-600">Está agendado</span>
                        </div>
                        <div class="flex items-center mt-1">
                            <span class="font-weight-600 mr-2">Cliente:</span>
                            <span class="text-lg">{{ hourSelected.user_name }}</span>
                        </div>
                        <div class="flex items-center mt-1">
                            <span class="font-weight-600 mr-2">Data de agendamento:</span>
                            <span>{{ convertDateFirestore(hourSelected.scheduled_at) }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-span-1">
                    <FormCheckbox :text="hourSelected.is_active ? `Ativado` : `Desativado`" :initValue="hourSelected.is_active" code="4455" @update="(value) => hourSelected.is_active = value" class="mt-2" />
                    <FormCheckbox :text="hourSelected.is_open ? `Aberto` : `Fechado`" :initValue="hourSelected.is_open" code="3544" @update="(value) => hourSelected.is_open = value" class="mt-2" />
                    <FormCheckbox :text="hourSelected.is_cancelled ? `Cancelado` : `Cancelado`" :initValue="hourSelected.is_cancelled" code="5422" @update="(value) => hourSelected.is_cancelled = value" class="mt-2" />
                </div>
                <div class="col-span-1 mt-2">
                    <div class="flex flex-col items-start">
                        <div class="flex items-center">
                            <span class="font-weight-600 mr-2">Minutos:</span>
                            <span>{{ hourSelected.minutes }}</span>
                        </div>
                        <div v-if="hourSelected.updated_at" class="flex items-center mt-1">
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
                color="green-darken-4"
                variant="flat"
                @click="updateHour()"
            >
                Atualizar
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
    <v-expansion-panel :disabled="isAvaliableDay(year, month, day) ? false : true">
        <v-expansion-panel-title>{{ schedule.date }} - {{ schedule.barber_name }}</v-expansion-panel-title>
        <v-expansion-panel-text>
            <div class="grid grid-cols-1">
                <div class="col-span-1">
                    <FormCheckbox :text="schedule.is_active ? `Ativado` : `Desativado`" :initValue="schedule.is_active" code="2345" @update="(value) => schedule.is_active = value" class="mt-2" />
                    <FormCheckbox :text="schedule.is_open ? `Aberto` : `Fechado`" :initValue="schedule.is_open" code="1457" @update="(value) => schedule.is_open = value" class="mt-2" />
                </div>
                <div class="col-span-1 mt-2">
                    <div class="flex flex-col">
                        <div class="flex items-center">
                            <span class="text-[0.8rem] font-weight-400 mr-1">Total de agendamentos:</span>
                            <span class="font-weight-500">{{ schedule.duration_of_schedules }}</span>
                        </div>
                        <!--<div class="flex items-center">
                            <span class="text-[0.8rem] font-weight-400 mr-1">Agendamentos disponíveis:</span>
                            <span class="font-weight-500">{{ schedule.schedules_available }}</span>
                        </div>-->
                        <div class="flex items-center">
                            <span class="text-[0.8rem] font-weight-400 mr-1">Dia:</span>
                            <span class="font-weight-500">{{ schedule.day }}</span>
                        </div>
                        <div class="flex items-center">
                            <span class="text-[0.8rem] font-weight-400 mr-1">Mês:</span>
                            <span class="font-weight-500">{{ schedule.month_formatted }}</span>
                        </div>
                        <div class="flex items-center">
                            <span class="text-[0.8rem] font-weight-400 mr-1">Duração:</span>
                            <span class="font-weight-500">{{ schedule.duration_formatted }}</span>
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
                        <div v-if="hours.length > 0" class="col-span-1 mt-1">
                            <v-list
                                lines="one"
                                density="compact"
                                class="grid grid-cols-12 gap-4"
                            >
                                <v-list-item
                                    v-for="(hour, i) in hours"
                                    :key="i"
                                    :disabled="isAvaliableHour(hour.hour_start, year, month, day) ? false : true"
                                    :value="hour"
                                    class="col-span-12 md:col-span-6"
                                    style="padding: 0;"
                                    @click="openDialog(hour)"
                                >
                                    <!-- Conteúdo completo do v-list-item -->
                                    <template v-slot:default>
                                        <!-- Personalize o conteúdo do item aqui -->
                                        <div :class="hour.is_scheduled ? `bg-green-200 hover:bg-green-500 hover:text-white` : `bg-gray-200 hover:bg-gray-500 hover:text-white`" class="w-full h-full p-2 rounded shadow flex items-center justify-between" :style="isAvaliableHour(hour.hour_start, year, month, day) ? `` : `background-color: rgba(150, 17, 17, 0.3) !important;`">
                                            <div class="flex items-center">
                                                <div v-if="hour.is_active" class="mr-2">
                                                    <Icon name="ic:baseline-alarm" class="text-sm sm:text-base lg:text-lg" />
                                                    <v-tooltip text="Ativo" activator="parent" location="top" />
                                                </div>
                                                <div v-else class="mr-2">
                                                    <Icon name="ic:baseline-alarm-off" class="text-sm sm:text-base lg:text-lg" />
                                                    <v-tooltip text="Desativado" activator="parent" location="top" />
                                                </div>
                                                <span class="text-sm">{{ hour.name }}</span>
                                            </div>
                                            <div v-if="hour.is_cancelled || !hour.is_open" class="flex md:items-center">
                                                <div v-if="hour.is_cancelled">
                                                    <Icon name="mdi:cancel" class="text-sm sm:text-base lg:text-lg" />
                                                    <v-tooltip text="Cancelado" activator="parent" location="top" />
                                                </div>
                                                <div v-if="!hour.is_open" class="mx-1">
                                                    <Icon name="mdi:close-circle" class="text-sm sm:text-base lg:text-lg" />
                                                    <v-tooltip text="Fechado" activator="parent" location="top" />
                                                </div>
                                            </div>
                                        <!-- Adicione mais elementos conforme necessário -->
                                        </div>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </div>
                    </div>
                </div>
            </div>
        </v-expansion-panel-text>
    </v-expansion-panel>
</template>
<style lang="scss" scoped>
</style>