# 手写 Ajax（XHR + Promise）

以下内容整理自本仓库历史讨论稿，仅对明显笔误做了修正（如 `encodeURIComponent`、`responseText` 等），以便示例可读、可跑。

```javascript
const Ajax = (obj) => {
  return new Promise((resolve, reject) => {
    const method = obj.method || 'GET';
    let xhr;
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else {
      xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    xhr.ontimeout = () => {
      reject({
        errorType: 'timeout_error',
        xhr,
      });
    };
    xhr.onerror = () => {
      reject({
        errorType: 'onerror',
        xhr,
      });
    };
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
          resolve(xhr.responseText);
        } else {
          reject({
            errorType: 'onerror',
            xhr,
          });
        }
      }
    };
    if (method === 'POST') {
      xhr.open('POST', obj.url, true);
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xhr.send(JSON.stringify(obj.data));
    } else {
      let query = '';
      for (const key in obj.data) {
        if (Object.prototype.hasOwnProperty.call(obj.data, key)) {
          query += `${encodeURIComponent(key)}=${encodeURIComponent(obj.data[key])}&`;
        }
      }
      query = query.replace(/&$/, '');
      xhr.open('GET', query ? `${obj.url}?${query}` : obj.url, true);
      xhr.send();
    }
  });
};
```
