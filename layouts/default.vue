<script lang="ts">
  import { getAuth, signInWithCustomToken, signOut } from "firebase/auth";
  import { collection, getDocs, query, where, doc, getDoc, addDoc, Timestamp } from 'firebase/firestore';
  import { useToast } from 'vue-toastification';
  import { useFirebase } from '@/composables/useFirebase';
  import { useAuthentication } from '@/stores/authentication';

  export default {
    setup() {

      const windowWidth = ref<number>(0)
      const loading = ref<boolean>(true)
      const { firestore, auth } = useFirebase()
      const router = useRouter()
      const toast = useToast()
      const authentication: any = useAuthentication()

      const getWindow = () => {
        windowWidth.value = window.innerWidth
      }

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
          }
        } else {
          loading.value = false
        }
      }

      onMounted(() => {
        setTimeout(() => {
          isLogin()
        }, 1500)
      })

      return {
        //changeNav,
        windowWidth,
        loading,
      }
    }
  } 
</script>

<template>
  <div class="bg-neutral-700 min-h-[100%]">
    <slot v-if="!loading" />
  </div>
</template>

<style lang="scss" scoped>
body {
        overflow: hidden;
    }
</style>