<template>
    <div id="app">
      <cropper ref="cropper" class="cropper" @change="change" :src="image.src" :stencil-props="{ aspectRatio: 12/12 }" />
      <div class="button-wrapper">
        <button class="button" @click="file.click()">
          <input
            type="file"
            ref="file"
            @change="uploadImage($event)"
            accept="image/*"
          />
          Escolher imagem
        </button>
        <button class="button" :class="image.src ? `` : `opacity-50 my-button-disable`" @click="cropImage()">Cortar imagem</button>
        <button class="button" :class="image.src ? `` : `opacity-50 my-button-disable`" @click="sendFile()">Enviar imagem</button>
      </div>
    </div>
  </template>
  
  <script>
  import { Cropper } from "vue-advanced-cropper";
  import "vue-advanced-cropper/dist/style.css";
  
  export default defineComponent({
    components: {
      Cropper,
    },
    setup(props, { emit }) {
      const image = reactive({
        src:
          "",
        type: "image/jpg",
      });
      const fileImage = reactive({
        file: ""
      })
  
      const cropper = ref();
      const file = ref();
  
      const cropImage = () => {
        if (cropper.value) {
          const { canvas } = cropper.value.getResult();
          image.src = canvas.toDataURL(image.type)
          canvas.toBlob((blob) => {
            // Cria um objeto de arquivo a partir do blob
            const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
            // Atualiza a variável reativa com o objeto de arquivo
            fileImage.file = file;
          }, 'image/jpeg');
        }
      };
  
      const uploadImage = (event) => {
        /// Reference to the DOM input element
        const { files } = event.target;
        fileImage.file = files[0]
        // Ensure that you have a file before attempting to read it
        if (files && files[0]) {
          // 1. Revoke the object URL, to allow the garbage collector to destroy the uploaded before file
          if (image.src) {
            URL.revokeObjectURL(image.src);
          }
          // 2. Create the blob link to the file to optimize performance:
          const blob = URL.createObjectURL(files[0]);
  
          // 3. Update the image. The type will be derived from the extension and it can lead to an incorrect result:
          image.src = blob;
          image.type = files[0].type;
        }
      };

      const sendFile = () => {
        emit('send-file', fileImage)
      }
  
      onUnmounted(() => {
        if (image.src) {
          URL.revokeObjectURL(image.src);
        }
      });
  
      return {
        image,
        cropper,
        file,
        uploadImage,
        cropImage,
        sendFile
      };
    },
  });
  </script>
  
  <style lang="scss">
  #app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
  
  .cropper {
    max-height: 400px;
  }
  
  .button-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 17px;
    @media(max-width: 700px) {
      flex-direction: column;
      justify-content: start;
    }
  }
  
  .button {
    color: white;
    font-size: 16px;
    padding: 10px 20px;
    width: 100%;
    background: #151515;
    cursor: pointer;
    transition: background 0.5s;
    border: none;
    &:not(:last-of-type) {
      margin-right: 10px;
    }
    &:hover {
      background: #2F2F2F;
    }
    input {
      display: none;
    }
    @media(max-width: 700px) {
      margin-top: 6px;
    }
  }
  </style>