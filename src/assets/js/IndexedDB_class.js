import Vue from "vue";

let objectStores = {
    objectStoreName: 'shopping cart',
    index: [
        // 索引 
        // unique 是否可以重复 
        // multiEntry 值是数组才时使用 默认false, 当 true 以数组成员作为索引键，
        // { name: 'groupId', option: { unique: false, multiEntry: true } },
        { name: 'groupId', option: { unique: false } },
        { name: 'price', option: { unique: false } }
    ]
}


/**
 * 封装IndexedDB类
 * @param {String} dbName 数据库名称
 * @param {Object} objectStores 仓库信息
 * @param {Number} version 数据库版本
 *  
 */
export class MyIndexedDB {

    constructor(dbName, objectStores, version = 1) {
        this._db = undefined;
        this._dbName = dbName;
        this._version = version;
        this._objectStores = objectStores || {};
        this._myIndexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB
        this._myIDBkeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        // this.openDB();
    }
    _vueToObject = (vueObject) => {
        let _object = vueObject;
        // 针对Vue3做的类型判断
        if (typeof Vue.isRef === "function") {
            if (Vue.isRef(_object)) {
                // 如果是 vue 的 ref 类型，替换成 ref.value
                _object = _object.value;
            }
        }
        if (typeof Vue.isReactive === "function") {
            if (Vue.isReactive(_object)) {
                // 如果是 vue 的 reactive 类型，那么获取原型，否则会报错
                _object = Vue.toRaw(_object);
            }
        }
        return _object
    };

    /**
     * 开启indexedDB数据库
     * @param {String} dbName  数据库名称
     * @param {Number} version 版本号
     * @returns {Promise}
     */
    openDB = (dbName, version) => {
        let name = this._dbName || dbName;
        let ver = this._version || version;
        // 记录数据库版本是否变更
        let isChange = false;
        let dbRequest = this._myIndexedDB.open(name, ver);
        // 打开数据库的promise
        const dbPromise = new Promise((resolve, reject) => {
            // 数据库成功打开回调
            dbRequest.onsuccess = (event) => {
                console.log("数据库准备就绪！");
                this._db = event.target.result;
                // 监听版本发生变化
                this._db.onversionchange = () => {
                    let r = confirm("Database is outdated, please reload the page!");
                    if (r) {
                        // true 刷新界面
                        this._db.close();
                        window.location.reload();
                    } else {
                        // false
                    }
                };
                resolve(this._db);

                // if (isChange) {
                //     // 版本发生变化or第一次创建

                // } else {
                //     resolve(this._db);
                // }
            }
            dbRequest.onerror = (event) => {
                let error = event.target.error
                console.log("数据库打开失败！\n Error：", error);
                reject(error);
            };

        });
        dbRequest.onupgradeneeded = (event) => {
            isChange = true;
            this._db = event.target.result;
            let storeName = this._objectStores.objectStoreName;
            if (!this._db.objectStoreNames.contains(storeName)) {
                const objectStore = this._db.createObjectStore(storeName, { keyPath: "id" }); // 创建仓库(表) 主键 
                // 创建索引
                for (let i = 0; i < this._objectStores.index.length; i++) {
                    const index = this._objectStores.index[i];
                    objectStore.createIndex(index.name, index.name, index.option);
                }
            }
        }

        dbRequest.onblocked = (event) => {
            // 监听处理器旧链接未被关闭的情况
            // 如果正确的处理了onversionchange 事件，则该事件就不该触发
        }
        return dbPromise
    };

    /**
     * 关闭DB
     */
    closeDB = () => {
        if (typeof this._db == "undefined") {

        } else {
            db.close();
            console.log('数据库已关闭！')
        }
    };

    /**
     * 添加对象
     * @param {String} storeName 仓库名称
     * @param {Object} object 要添加的对象
     * @returns {Promise}
     */
    addObject = (storeName, object) => {
        const _object = this._vueToObject(object);
        const objectPromise = new Promise((resolve, reject) => {
            const _addObject = () => {
                    const transaction = this._db.transaction(storeName, 'readwrite');
                    transaction
                        .objectStore(storeName)
                        .add(_object)
                        .onsuccess = (event) => {
                            resolve(event.target.result);
                        };
                    transaction.onerror = (event) => {
                        console.log("数据写入失败！ Error:", event.target.error);
                        // if (event.target.error.name == "ConstraintError") {
                        //     event.preventDefault(); // 防止事务终止
                        //     event.stopPropagation(); // 停止错误冒泡，阻止其冒泡传播
                        // }
                        // reject(event.target.error);
                    }
                }
                // 判断数据库是否断开
            if (typeof this._db === "undefined") {
                this.openDB().then(() => {
                    _addObject();
                })
            } else {
                _addObject();
            }
        });
        return objectPromise;
    };

    /**
     * 更新对象
     * @param {string} storeName 仓库名称
     * @param {Object} object 更新对象数据
     * @returns {Promise}
     */
    updateObject = (storeName, object) => {
        const _object = this._vueToObject(object);
        const objectPromise = new Promise((resolve, reject) => {
            const _updateObject = () => {
                const transaction = this._db.transaction(storeName, 'readwrite');
                transaction
                    .objectStore(storeName)
                    .get(_object.id) // 获取要更新的对象
                    .onsuccess = (event) => {
                        // 从仓库里提取对象，把修改值合并到对象里面。
                        const newObject = {...event.target.result, ..._object };
                        transaction
                            .objectStore(storeName)
                            .put(newObject)
                            .onsuccess = (event) => {
                                console.log("更新数据成功！");
                                resolve(event.target.result);
                            }
                    };
                transaction.onerror = (event) => {
                    console.log("更新数据失败！");
                    reject(event.target.error);
                }

            }

            // 判断数据库是否断开
            if (typeof this._db === "undefined") {
                this.openDB().then(() => {
                    _updateObject();
                })
            } else {
                _updateObject();
            }
        });
        return objectPromise;
    };

    /**
     * 通过主键删除对象
     * @param {string} storeName  仓库名称
     * @param {string} key  主键名称
     * @returns {Promise}
     */
    deleteObjectWithKey = (storeName, key) => {
        const objectPromise = new Promise((resolve, reject) => {
            const _deleteObject = () => {
                const transaction = this._db.transaction(storeName, "readwrite");
                transaction
                    .objectStore(storeName)
                    .delete(key) // 删除对象
                    .onsuccess = (event) => {
                        resolve(event.target.result);
                    };
                transaction.onerror = (event) => {
                    reject(event.target.error);
                }
            };
            // 判断数据库是否断开
            if (typeof this._db === "undefined") {
                this.openDB().then(() => {
                    _deleteObject();
                })
            } else {
                _deleteObject();
            }
        });
        return objectPromise;
    };

    /**
     * 清空仓库对象
     * @param {string} storeName 仓库名称
     * @returns {Promise}
     */
    clearStore = (storeName) => {
        const objectPromise = new Promise((resolve, reject) => {
            const _clearStore = () => {
                const transation = this._db.transaction(storeName, "readwrite");
                transation
                    .objectStore(storeName)
                    .clear()
                    .onsuccess = (event) => {
                        console.log("清空仓库成功！");
                        resolve(event);
                    };
                transation.onerror = (event) => {
                    console.log("清空仓库失败！");
                    reject(event);
                }
            };
            // 判断数据库是否断开
            if (typeof this._db === "undefined") {
                this.openDB().then(() => {
                    _clearStore();
                })
            } else {
                _clearStore();
            }
        });
        return objectPromise;
    };

    /**
     * 删除整个store
     * 该方法有错误，请慎用:
     * 与 IDBDatabase.createObjectStore 一样，此方法只能在versionchang事务中调用。
     * 否则会报错：The database is not running a version change transaction.
     * @param {string} storeName 仓库名称
     * @returns {Promise}
     */
    deleteStore = (storeName) => {
        const objectPromise = new Promise((resolve, reject) => {
            const _deleteStore = () => {
                    // const transaction = this._db.transaction(storeName, 'readwrite');
                    // const store = transaction.objectStore(storeName);
                    // const request = store.delete();
                    // const request = store.deleteObjectStore();
                    const request = this._db.deleteObjectStore(storeName);
                    request.onsuccess = (event) => {
                        console.log("删除仓库成功！");
                        resolve(event)
                    };
                    request.onerror = (event) => {
                        debugger
                        console.log("删除仓库失败！");
                        reject(event);
                    };
                    // transaction.onerror = (event) => {
                    //     console.log("删除仓库失败！");
                    //     reject(event);
                    // };
                }
                // 判断数据库是否断开
            if (typeof this._db === "undefined") {
                this.openDB().then(() => {
                    _deleteStore();
                })
            } else {
                _deleteStore();
            }
        });
        return objectPromise;
    };

    /**
     * 删除数据库
     * @param {String} dbName 数据库名称
     * @returns {Promise}
     */
    deleteDB = (dbName) => {
        const objectPromise = new Promise((resolve, reject) => {
            const result = this._myIndexedDB.deleteDatabase(dbName);
            result.onsuccess = (event) => {
                console.log("删除数据库成功！");
                resolve(event)
            };
            result.onerror = (event) => {
                console.log("删除数据库失败！");
                reject(event);
            }

        });
        return objectPromise;
    };

    /**
     * 按主键获取对象，或者获取全部
     * @param {string} storeName 仓库名称
     * @param {string} key 主键名称
     * @returns {Promise}
     */
    getObjectWithKey = (storeName, key) => {
        const objectPromise = new Promise((resolve, reject) => {
            const _getObjectWithKey = () => {
                const transaction = this._db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                let dbRequest;
                //判断获取key对应的对象，还是获取全部
                if (typeof key === 'undefined' || key === "") {
                    dbRequest = store.getAll();
                } else {
                    dbRequest = store.get(key);
                }
                dbRequest.onsuccess = (event) => {
                    // 返回查找到的对象
                    resolve(event.target.result);
                }
                transaction.onerror = (event) => {
                    reject(event);
                }
            };
            // 判断数据库是否断开
            if (typeof this._db === "undefined") {
                this.openDB().then(() => {
                    _getObjectWithKey();
                })
            } else {
                _getObjectWithKey();
            }

        });
        return objectPromise;
    };


    /**
     * 依据 索引+游标，获取对象，可以获取多条。
     * @param {string} storeName 仓库名称
     * @param {object} findInfo  查询条件
     * findInfo = {
     *   indexName: 'groupId', // 索引名称
     *   indexValue: 1, // 索引值
     *   indexKind: '=', // '>','>=','<','<=','between' 索引方式,
     *   betweenInfo: {
     *     lower:1,
     *     upper:2,
     *     lowerOpen:true,
     *     upperOpen:true,
     *   },
     *   where：(object) => { // 钩子函数，用来筛选数据
     *     reutrn Bool;
     *   }
     * }
     * @param {object} page 页码
     * page：{
     *   start:开始,
     *   count:数量, 
     *   description:'next' 
     *    next 升序
     *    prev 降序
     *    nextunique 升序，只取一
     *    prevunique 降序，只取一
     * }
     * @returns  {Promise}
     */
    findObject = (storeName, findInfo = {}, page = {}) => {
        debugger
        const _start = page.start || 0;
        const _count = page.count || 0;
        const _end = _start + _count;
        const _discription = page.description || "prev"; // 默认降序
        // 查询条件，按照主键或者索引查询
        let keyRange = null
        if (typeof findInfo.indexName !== "undefined") {
            if (typeof findInfo.indexKind !== "undefined") {
                const indexValue = findInfo.indexValue;
                const rangeDic = {
                    "=": IDBKeyRange.only(indexValue),
                    ">": IDBKeyRange.lowerBound(indexValue, true),
                    ">=": IDBKeyRange.lowerBound(indexValue, false),
                    "<": IDBKeyRange.upperBound(indexValue, true),
                    "<=": IDBKeyRange.upperBound(indexValue, false),
                };
                switch (findInfo.indexKind) {
                    case "=":
                    case ">":
                    case ">=":
                    case "<":
                    case "<=":
                        keyRange = rangeDic[findInfo.indexKind];
                        break;
                    case "between":
                        const betweenInfo = findInfo.betweenInfo;
                        keyRange = IDBKeyRange.bound(betweenInfo.lower, betweenInfo.upper, betweenInfo.lowerOpen, betweenInfo.upperOpen);
                        break

                }
            }
        }
        console.log('findObject - keyRange', keyRange)
        const objectPromise = new Promise((resolve, reject) => {
            const _findObjectByIndex = () => {
                    const dataList = [];
                    let cursorIndex = 0; // 游标
                    const transaction = this._db.transaction(storeName, "readonly");
                    const store = transaction.objectStore(storeName);
                    let cursorRequest;
                    // 判断是否按照索引查询
                    if (typeof findInfo.indexName === "undefined") {
                        cursorRequest = store.openCursor(keyRange, _discription); // 通过光标查询
                    } else {
                        cursorRequest = store
                            .index(findInfo.indexName) // 根据索引建定位
                            .openCursor(keyRange, _discription); // 通过光标查询
                    }
                    cursorRequest.onsuccess = (event) => {
                        const cursor = event.target.result
                        if (cursor) {
                            // _end !== 0 
                            if (_end === 0 || (cursorIndex >= _start && cursorIndex < _end)) {
                                if (typeof findInfo.where === 'function') {
                                    // 根据where钩子函数筛选数据
                                    // where 返回bool
                                    if (findInfo.where(cursor.value, cursorIndex)) {
                                        dataList.push(cursor.value);
                                        cursorIndex++;
                                    }
                                } else {
                                    // 无额外筛选条件
                                    dataList.push(cursor.value);
                                    cursorIndex++;
                                }
                            }
                            cursor.continue(); // 将光标移至匹配范围中的下一个值(光标继续向下移动)
                        }
                    };
                    transaction.oncomplete = (event) => {
                        // 查询结束
                        debugger
                        resolve(dataList);
                    };
                    transaction.onerror = (event) => {
                        console.log("findObjectByIndex error", event.target.error);
                        reject(event);
                    }

                }
                // 判断数据库是否断开
            if (typeof this._db === "undefined") {
                this.openDB().then(() => {
                    _findObjectByIndex();
                })
            } else {
                _findObjectByIndex();
            }

        });
        return objectPromise;
    }

}