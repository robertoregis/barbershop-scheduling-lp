import { defineStore } from 'pinia';

export interface InterfaceShow {
    isNav: boolean,
    isNavModal: boolean,
    isMenu: boolean,
    moduleActive: string,
    isLoadingGlobal: boolean,
    isLoadingLoginGlobal: boolean
}

export const useShow = defineStore('show', {
    state: (): InterfaceShow => ({
        isNav: true,
        isNavModal: false,
        isMenu: false,
        moduleActive: '',
        isLoadingGlobal: false,
        isLoadingLoginGlobal: false
    }),
    actions: {
        setNav(dataNav: boolean) {
            this.isNav = dataNav
        },
        setNavModal(dataNavModal: boolean) {
            this.isNavModal = dataNavModal
        },
        setMenu(dataMenu: boolean) {
            this.isMenu = dataMenu
        },
        setModuleActive(dataModuleActive: string) {
            this.moduleActive = dataModuleActive
        },
        setIsLoadingGlobal(dataIsLoadingGlobal: boolean) {
            this.isLoadingGlobal = dataIsLoadingGlobal
        },
        setIsLoadingLoginGlobal(dataIsLoadingLoginGlobal: boolean) {
            this.isLoadingLoginGlobal = dataIsLoadingLoginGlobal
        }
    },
    getters: {
        getNav(): boolean {
            return this.isNav
        },
        getNavModal(): boolean {
            return this.isNavModal
        },
        getMenu(): boolean {
            return this.isMenu
        },
        getModuleActive(): string {
            return this.moduleActive
        },
        getIsLoadingGlobal(): boolean {
            return this.isLoadingGlobal
        },
        getIsLoadingLoginGlobal(): boolean {
            return this.isLoadingLoginGlobal
        }
    }
})

