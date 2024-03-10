import { defineStore } from 'pinia';

export interface InterfaceShow {
    data_schedule: object,
    user: object,
    anomymous_code: any
}

export const useData= defineStore('data', {
    state: (): InterfaceShow => ({
        data_schedule: {},
        user: {},
        anomymous_code: null
    }),
    actions: {
        setDataSchedule(dataSchedule: object) {
            this.data_schedule = dataSchedule
        },
        setUser(dataUser: object) {
            this.user = dataUser
        },
        setAnomynousCode(dataCode: string) {
            this.anomymous_code = dataCode
        }
    },
    getters: {
        getDataSchedule(): object {
            return this.data_schedule
        },
        getUser(): object {
            return this.user
        },
        getAnomynousCode(): any {
            return this.anomymous_code
        }
    }
})

