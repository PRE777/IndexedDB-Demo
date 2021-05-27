/**
 * 开启数据库
 * @param {object} dbName 数据库名称
 * @param {string} storeName 仓库名称
 * @param {string} version 数据库版本
 * @returns {object} 函数返回一个数据库实例，或者错误信息
 */
export function openDB(dbName, storeName, version = 1) {
    return new Promise((resolve, reject) => {
        let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        let db = undefined;
        const result = indexedDB.open(dbName, version);
        result.onsuccess = function(event) {
            db = event.target.result;
            console.log("数据库准备就绪！");
            db.onversionchange = function() {
                db.close();
                // alert("Database is outdated, please reload the page!");
                let r = confirm("Database is outdated, please reload the page!");
                if (r) {
                    // true 刷新界面
                    window.location.reload();
                } else {
                    // false
                }
            };
            resolve(db);
        }
        result.onerror = function(event) {
            // console.error("Error", openRequest.error);
            console.log("数据库打开失败");
            reject(event.target.error);
        };

        result.onupgradeneeded = function(event) {
            // 如果客户端没有数据库或者版本过低 则触发
            db = event.target.result;
            let objectStore = undefined;
            if (!db.objectStoreNames.contains(storeName)) {
                objectStore = db.createObjectStore(storeName, { keyPath: "id" });
                objectStore.createIndex("price", "price", { unique: false }); // 创建索引 可以搜索任何字段（必须在此处）
                objectStore.createIndex("author", "author", { unique: false, multiEntry: true });

            }
        }
        result.onblocked = function(event) {
            // 监听处理器旧链接未被关闭的情况
            // 如果正确的处理了onversionchange 事件，则该事件就不该触发
        }
    })
}

/**
 * 新增数据
 * @param {IDBDatabase} db 数据库实例
 * @param {string} storeName 仓库名称
 * @param {object} data 数据
 */
export function addData(db, storeName, data) {
    let transaction = db.transaction([storeName], "readwrite"); //事务对象，指定表格名称和操作模式（"只读" readonly or "读写" readwrite）
    let objectStore = transaction.objectStore(storeName); // 仓库对象
    const result = objectStore.add(data);
    result.onsuccess = function(event) {
        console.log("数据写入成功！");
    }
    result.onerror = function(event) {
        // add 在相同id存在的情况下，发生ConstraintError
        console.log("数据写入失败！ Error:", event.target.error);
        if (event.target.error.name == "ConstraintError") {
            event.preventDefault(); // 防止事务终止
            event.stopPropagation(); // 停止错误冒泡，阻止其冒泡传播
        } else {
            // 意外错误
            // 事务终止执行
        }
    }
}

/**
 * 通过主键读取数据
 * @param {IDBDatabase} db 数据库实例
 * @param {string} storeName 仓库名称
 * @param {string} key 主键名称
 * @returns {object} 查询结果
 */
export function getDataByKey(db, storeName, key = null) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction([storeName], "readonly");
        let objectStore = transaction.objectStore(storeName);
        let result;
        if (key) {
            result = objectStore.get(key);
        } else {
            result = objectStore.getAll();
        }
        result.onsuccess = function(event) {
            console.log("主键查询结果：", event.target.result);
            resolve(event.target.result);
        }
        result.onerror = function(event) {
            console.log("主键查询失败！__ ^ _ ^__");
            reject(event.target.error);
        }
    });
}

/**
 * 通过带索引的字段读取数据
 * @param {IDBDatabase} db 数据库实例
 * @param {string} storeName 仓库名城管
 * @param {string} indexName 索引名称
 * @param {string} indexValue 索引值
 * @returns {object} 查询结果
 */
export function getDataByIndex(db, storeName, indexName, indexValue) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction([storeName], 'readonly');
        let objectStore = transaction.objectStore(storeName);
        let index = objectStore.index(indexName);
        const result = index.getAll(indexValue);
        result.onerror = function(event) {
            console.log("索引查询失败！__ ^ _ ^__");
            reject(event.target.error);
        }
        result.onsuccess = function(event) {
            console.log("主键查询结果：", event.target.result);
            resolve(event.target.result);
        }
    });
}

/**
 * 通过游标读取数据
 * @param {IDBDatabase} db 数据库实例
 * @param {string} storeName 仓库名称
 * @param {IDBKeyRange} query 查询条件
 * @returns {Array} 获取到的数据
 */
export function cursorGetData(db, storeName, query = null) {
    return new Promise((resolve, reject) => {

        let list = [];
        let transaction = db.transaction([storeName], "readonly");
        let objectStore = transaction.objectStore(storeName);

        let request = undefined; // 指针对象
        if (query) {
            request = objectStore.openCursor(query); // 指针对象
        } else {
            request = objectStore.openCursor(); // 指针对象
        }
        request.onsuccess = function(event) {
            let cursor = event.target.result;
            if (cursor) {
                list.push(cursor.value);
                cursor.continue(); // 遍历存储对象中的所有内容
            } else {
                resolve(list);
            }
        }
        request.onerror = function(event) {
            console.log("游标查询失败！\n Error:", event.target.error);
            reject(event.target.error);
        }

    })
}

/**
 * 更新数据库
 * @param {IDBDatabase} db 数据库实例
 * @param {string} storeName 仓库名称
 * @param {object} data 需要更新的数据
 */
export function updateObject(db, storeName, data) {
    let transaction = db.transaction([storeName], "readwrite");
    let objectStore = transaction.objectStore(storeName);
    let result = objectStore.put(data);
    result.onsuccess = function() {
        console.log("更新数据成功！");
    }
    result.onerror = function(event) {
        console.log("更新数据失败！\nError:", event.target.error);
    }
}

/**
 * 通过主键删除数据
 * @param {IDBDatabase} db 数据库实例
 * @param {string} storeName 仓库名
 * @param {object} key 主键名称
 */
export function deleteDataWithKey(db, storeName, key) {
    let transaction = db.transaction([storeName], "readwrite");
    let objectStore = transaction.objectStore(storeName);
    let result = objectStore.delete(key);
    result.onsuccess = function() {
        console.log("删除数据成功！");
    }
    result.onerror = function() {
        console.log("删除数据失败！");
    }
}

/**
 * 清空指定仓库数据
 * @param {IDBDatabase} db 数据库实例
 * @param {string} storeName 仓库名称
 */
export function clearStore(db, storeName) {
    let result = db.transaction([storeName], "readwrite").objectStore(storeName).clear();
    result.onsuccess = function() {
        console.log("清空数据库成功！");
    }
    result.onerror = function(event) {
        console.log("清空数据库失败！\n Error:", event.target.error);
    }
}

/**
 * 通过索引和游标删除指定的数据
 * @param {IDBDatabase} db 数据库实例
 * @param {string} storeName 仓库名称
 * @param {string} indexName 索引名称
 * @param {string} indexValue 索引名
 */
export function cursorDeleteData(db, storeName, indexName, indexValue) {
    let keyRange =
        window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    let store = db.transaction([storeName], 'readwrite').objectStore(storeName);
    let result = store.index(indexName).openCursor(keyRange.only(indexValue));
    result.onsuccess = function(event) {
        let cursor = event.target.result;
        let deleteRequest;
        if (cursor) {
            deleteRequest = cursor.delete(); // 请求删除当前项
            deleteRequest.onsuccess = function(event) {
                console.log('游标删除该记录成功')
            }
            deleteRequest.onerror = function(event) {
                console.log("索引和游标删除指定的数据失败！\n Error:", event.target.error);
            }
        }
    }
    result.onerror = function(event) {
        console.log("索引和游标删除指定的数据失败！\n Error:", event.target.error);
    }
}

/**
 * 删除指定的对象仓库
 * 与 IDBDatabase.createObjectStore 一样，此方法只能在versionchang事务中调用。
 * 否则会报错：The database is not running a version change transaction.
 * @param {IDBDatabase} db 数据库实例    
 * @param {String} storeName  仓库名称
 */
export function deleteStore(db, storeName) {
    // let transaction = db.transaction(storeName, 'readwrite');
    // let store = transaction.objectStore(storeName);
    // let result = store.delete();
    let result = db.deleteObjectStore(storeName);
    result.onsuccess = function(event) {
        console.log("删除仓库成功！");
    }
    result.onerror = function(event) {
        console.log("删除仓库失败！\nError:", event.target.error);
    }
}

/**
 * 关闭数据库
 * @param {object} db 数据库实例
 */
export function closeDB(db) {
    db.close();
    console.log('数据库已关闭！')
}

/**
 * 删除数据库
 * @param {string} dbName 数据库名称
 */
export function deleteDB(dbName) {
    let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    let result = indexedDB.deleteDatabase(dbName);
    result.onsuccess = function(event) {
        console.log("删除数据库成功！");
    }
    result.onerror = function(event) {
        console.log("删除数据库失败！\nError:", event.target.error);
    }
}