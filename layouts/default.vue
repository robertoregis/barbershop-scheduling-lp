<script lang="ts">
  import { getAuth, signInWithCustomToken, signOut } from "firebase/auth";
  import { doc, getDoc, addDoc, Timestamp } from 'firebase/firestore';
  import { useToast } from 'vue-toastification';
  import { useFirebase } from '../composables/useFirebase';
  import { useAuthentication } from '../stores/authentication';
  import { useShow } from '../stores/show';

  export default {
    setup() {

      const windowWidth = ref<number>(0)
      const loading = ref<boolean>(true)
      const { firestore, auth } = useFirebase()
      const router = useRouter()
      const toast = useToast()
      const authentication: any = useAuthentication()
      const show = useShow()

      const isLogin = async () => {
        const user: any = auth.currentUser;
        if(user) {
          let userData = await user.getIdTokenResult()
          const docRef = doc(firestore, "Users", userData.claims.user_id); // Referência ao documento "config"
          const docSnapshot = await getDoc(docRef); // Obtém o snapshot do documento

          if (docSnapshot.exists()) {
              authentication.setUserId(docSnapshot.id)
              authentication.setUser({
                id: docSnapshot.id,
                ...docSnapshot.data()
              })
              loading.value = false
          } else {
            signOut(auth).then(() => {
              loading.value = false
            })
          }
        } else {
          signOut(auth).then(() => {
            loading.value = false
          })
        }
      }

      onMounted(() => {
        setTimeout(() => {
          isLogin()
        }, 1500)
      })

      return {
        windowWidth,
        loading,
        show
      }
    }
  } 
</script>

<template>
  <div class="bg-neutral-700 min-h-[100%] relative">
    <slot v-if="!loading" />
    <div v-else class="h-screen w-screen flex justify-center items-center">
      <Loading />
    </div>
    <LoadingGlobal v-if="show.isLoadingGlobal" />
  </div>
</template>

<style lang="scss">
html { overflow-y: auto }
</style>