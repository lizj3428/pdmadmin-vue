
import Constants from '@/utils/constants';

/**
 * 本地存储保存
 * @param key 存储键名
 * @param value 存储值
 */
export const saveLocalStorage = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

/**
 * 获取本地存储
 * @param key 存储键名
 * @returns 存储的值，不存在返回空字符串
 */
export const getLocalStorage = (key: string) => {
  return localStorage.getItem(key) || '';
};

/**
 * 清空全部本地存储
 */
export const clearLocalStorage = () => {
  localStorage.clear();
};

/**
 * 拼接文件完整访问地址
 * @param url 文件相对路径
 * @returns 完整URL
 */
export const getFileUrl = (url: string) => {
  return Constants.BASE_URL + '/' + url;
};

/**
 * 逗号分隔的url字符串转为文件列表数组（适配Element Plus上传组件）
 * @param url 多个文件地址，逗号分隔的字符串
 * @returns 文件对象数组
 */
export const urls2Filelist = (url: any) => {
  const tlist: any = [];
  if (url) {
    url.split(',').map((item: string) => {
      let fullUrl = getFileUrl(item);
      const file = {
        name: item,
        url: fullUrl
      }
      tlist.push(file);
    });
  }
  return tlist;
};
