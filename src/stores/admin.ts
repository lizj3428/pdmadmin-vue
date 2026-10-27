import {defineStore} from "pinia";
import { computed, reactive, ref } from "vue";
import { clearLocalStorage, getLocalStorage, saveLocalStorage } from "@/utils/utils";
import Constants  from "@/utils/constants";
export const useAdminStore = defineStore('admin', () => { 
       const token = ref('')
       const admin = reactive({
         id:'',
         username:'',
         name:'',
         tel:'',
        
       }) 
       const getToken = computed(() => {
            if (token.value) {
              return token.value;
            }
            return getLocalStorage(Constants.USER_TOKEN)
       })   
       function setAdminInfo(data:any){
            admin.id = data.id
            admin.username = data.username
            admin.name = data.name
            admin.tel = data.tel
            token.value = data.token
            saveLocalStorage(Constants.USER_TOKEN, data.token);
       } 
       function loginout(){
         admin.id = ''
         admin.username = ''
         admin.name = ''
         admin.tel = ''
         token.value = ''
         clearLocalStorage();
       }
      
      return { token, setAdminInfo, loginout,admin,getToken }

})