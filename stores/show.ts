import { defineStore } from 'pinia';

export interface InterfaceShow {
    isLoadingGlobal: boolean,
    isLoadingLoginGlobal: boolean
}

export const useShow = defineStore('show', {
    state: (): InterfaceShow => ({
        isLoadingGlobal: false,
        isLoadingLoginGlobal: false
    }),
    actions: {
        setIsLoadingGlobal(dataIsLoadingGlobal: boolean) {
            this.isLoadingGlobal = dataIsLoadingGlobal
        },
        setIsLoadingLoginGlobal(dataIsLoadingLoginGlobal: boolean) {
            this.isLoadingLoginGlobal = dataIsLoadingLoginGlobal
        }
    },
    getters: {
        getIsLoadingGlobal(): boolean {
            return this.isLoadingGlobal
        },
        getIsLoadingLoginGlobal(): boolean {
            return this.isLoadingLoginGlobal
        }
    }
})

