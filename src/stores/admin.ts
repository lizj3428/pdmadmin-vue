import {defineStore} from "pinia";
import { computed, reactive, ref } from "vue";
import { clearLocalStorage, getLocalStorage, saveLocalStorage } from "@/utils/utils";
import Constants  from "@/utils/constants";
export const useAdminStore = defineStore('admin', () => { 
       const token = ref('')
       // 登录身份：admin 管理员 / teacher 教师 / student 学生
       // 后两者必须是 adminFlag=1（被授权）才能进到管理端
       const identity = ref(getLocalStorage(Constants.USER_IDENTITY) || 'admin')
       // 有没有管理端权限。存在 localStorage 里，刷新页面后路由守卫还能用
       const adminFlag = ref(getLocalStorage(Constants.USER_ADMIN_FLAG) === '1')
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
       /**
        * 保存登录信息
        * 三张表返回的字段名不一样（admin 是 username/name/tel，
        * 教师和学生是 teacherNo|studentNo/realName/phone），这里统一映射，
        * 顶栏就不用关心当前登录的到底是哪类账号了。
        */
       function setAdminInfo(data:any, idt:string = 'admin'){
            admin.id = data.id
            admin.username = data.username || data.teacherNo || data.studentNo || ''
            admin.name = data.name || data.realName || ''
            admin.tel = data.tel || data.phone || ''
            identity.value = idt
            // 管理员账号天然有权限；教师、学生要看后端返回的 adminFlag
            adminFlag.value = idt === 'admin' || data.adminFlag === 1
            token.value = data.token
            saveLocalStorage(Constants.USER_TOKEN, data.token);
            saveLocalStorage(Constants.USER_IDENTITY, idt);
            saveLocalStorage(Constants.USER_ADMIN_FLAG, adminFlag.value ? '1' : '0');
       } 
       /** 能不能进管理端（/index 那套页面） */
       const canManage = computed(() => identity.value === 'admin' || adminFlag.value)
       /** 顶栏显示用的中文身份名 */
       const identityName = computed(() => {
            if (identity.value === 'teacher') return '教师'
            if (identity.value === 'student') return '学生'
            return '管理员'
       })
       function loginout(){
         admin.id = ''
         admin.username = ''
         admin.name = ''
         admin.tel = ''
         token.value = ''
         identity.value = 'admin'
         adminFlag.value = false
         clearLocalStorage();
       }
      
      return { token, setAdminInfo, loginout, admin, getToken, identity, identityName, adminFlag, canManage }

})
