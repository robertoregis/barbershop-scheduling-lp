<script lang="ts">
    import { collection, Timestamp, doc, addDoc, getDoc, updateDoc } from 'firebase/firestore'
    import { ref as refStorage, getDownloadURL, uploadBytesResumable, deleteObject  } from "firebase/storage";
    import { useFirebase } from '../composables/useFirebase';
    import { useCreate } from '../composables/createFirebase';
    import { useToast } from 'vue-toastification';
    import { useData } from '../stores/data';
    import { useAuthentication } from '../stores/authentication';
    import { useShow } from '../stores/show';

    import { useRoute, useRouter } from 'vue-router';
    import { computed, onMounted, ref, watch } from 'vue';

    export default {
        setup() {
            const data: any = useData()
            const authentication: any = useAuthentication()
            const show = useShow()
            // para mexer com as tags heads
            useHead({
                title: `Barbearia do Bronxs`,
                meta: [
                {
                    name: 'description',
                    content: 'Site oficial para agendamentos na Barbearia do Bronxs'
                }
                ]
            })
            // usando o firestore do firebase
            const { firestore, auth, storage } = useFirebase()
            const { addInteraction, updateInfo } = useCreate()
            const router = useRouter()
            const toast = useToast()
            const loading = ref<boolean>(true)
            const date = ref<any>(new Date())
            const imageFile = ref<any>()
            const imageUrl = ref<any>(null);

            // função que recebe a imagem cortada
            const getFileCropper = (fileImage: any) => {
                //show.setIsLoadingGlobal(true)
                imageFile.value = fileImage.file
                imageUrl.value = URL.createObjectURL(fileImage.file)
            }

            const openModal = () => {
                setTimeout(() => {
                    let modalCropper:any = document.querySelector(`#ModalCropper`)
                    document.body.style.overflow = 'hidden'
                    if(modalCropper) {
                        modalCropper.style.display = "block"
                        setTimeout(() => {
                            let componentModalCropper:any = document.querySelector('#componentModalCropper')
                            console.log(componentModalCropper)
                            componentModalCropper.focus()
                        }, 500)
                    }
                }, 500)
            }

            const uploadImage = async (file: any) => {
                let dateTimestamp = Timestamp.fromDate(new Date())
                if(imageFile.value) {
                    show.setIsLoadingGlobal(true)
                    const metadata = {
                        contentType: file.type
                    };
                    // Upload file and metadata to the object 'images/mountains.jpg'
                    let array: any = []
                    for(let i = 0; i < 6; i++) {
                        let number = Math.random() * 9 / 10 * 9
                        let numberFloor = Math.floor(number)
                        array.push(numberFloor)
                    }
                    let newCode = array.join('')
                    let path = 'images/' + newCode + '-' + file.name 
                    const storageRef = refStorage(storage, path);
                    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
                    // Listen for state changes, errors, and completion of the upload.
                    uploadTask.on('state_changed',
                    (snapshot) => {
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        //console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                        }
                    },
                    (error) => {
                        show.setIsLoadingGlobal(false)
                        toast.error('Erro ao alterar a imagem')
                        switch (error.code) {
                        case 'storage/unauthorized':
                            break;
                        case 'storage/canceled':
                            break;
                        case 'storage/unknown':
                            break;
                        }
                    },
                    () => {
                        // Upload completed successfully, now we can get the download URL
                        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                            addInteraction({
                                text: `Atualizou a tua própria imagem`,
                                user_id: authentication.userId,
                                barber_id: "",
                                is_master: false,
                            })
                            updateInfo({
                                interactions: 1,
                            })
                            const userDocRef = doc(firestore, "Users", authentication.userId);
                            await updateDoc(userDocRef, {
                                image_path: path,
                                image_url: downloadURL,
                                updated_at: dateTimestamp,
                            });
                            if(authentication.user.image_path) {
                                const deleteRefImage = refStorage(storage, authentication.user.image_path)
                                await deleteObject(deleteRefImage)
                            }
                            const docSnapshot = await getDoc(userDocRef); // Obtém o snapshot do documento
                            if (docSnapshot.exists()) {
                                imageFile.value = null
                                imageUrl.value = null
                                authentication.setUserId(docSnapshot.id)
                                authentication.setUser({
                                    id: docSnapshot.id,
                                    ...docSnapshot.data()
                                })
                            }
                            show.setIsLoadingGlobal(false)
                            toast.success('Imagem alterada com sucesso')
                        });
                    }
                    );
                } else {
                    //toast.error('Selecione uma imagem')
                }
            }

            onMounted(() => {
                if(!authentication.userId) {
                    router.push('/')
                } else {
                    loading.value = false
                }
            })

            return {
                loading,
                data,
                authentication,
                date,
                getFileCropper,
                imageUrl,
                imageFile,
                openModal,
                uploadImage,
            }
        }
    }
</script>

<template>
    <main class="flex justify-center w-full py-6">
        <div class="container max-w-[600px] mx-auto p-2">
            <div v-if="!loading" class="grid grid-cols-1 shadow-lg rounded p-5 bg-white" style="border: 2px solid rgba(150, 150, 150, 0.1)">
                <div class="col-span-1 mt-3">
                    <div class="grid grid-cols-1">
                        <div class="col-span-1">
                            <div class="flex items-center justify-center">
                                <v-avatar :image="authentication.user.image_url" size="66"></v-avatar>
                                <Icon v-if="imageUrl" name="mdi:arrow-right-thick" class="mx-2 text-xl" />
                                <v-avatar v-if="imageUrl" :image="imageUrl" size="80"></v-avatar>
                            </div>
                        </div>
                        <div class="col-span-1 mt-3">
                            <div class="flex flex-col">
                                <div class="flex items-center justify-center">
                                    <div>
                                        <button @click="openModal()" class="bg-orange-800 rounded px-4 py-1 text-white">Trocar a imagem</button>
                                    </div>
                                </div>
                                <div v-if="imageFile" class="flex items-center justify-center mt-2">
                                    <div>
                                        <button @click="uploadImage(imageFile)" class="bg-green-800 rounded px-4 py-1 text-white">Salvar a imagem</button>
                                    </div>
                                </div>
                            </div>
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
    <ModalCropper modalId="ModalCropper" @send-file-cropper="getFileCropper" :aspectRatio="1" />
</template>
<style lang="scss" scoped></style>