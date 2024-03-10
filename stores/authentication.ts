import { defineStore } from 'pinia';

export interface InterfaceShow {
    user: object,
    userId: string,
}

export const useAuthentication = defineStore('authentication', {
    state: (): InterfaceShow => ({
        user: {},
        userId: ''
    }),
    actions: {
        setUser(dataUser: object) {
            this.user = dataUser
        },
        setUserId(dataUserId: string) {
            this.userId = dataUserId
        }
    },
    getters: {
        getUser(): object {
            return this.user
        },
        getUserId(): string {
            return this.userId
        }
    }
})

