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
                alert("Database is outdated, please reload the page!");
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
 * @param {object} db 数据库实例
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
 * @param {object} db 数据库实例
 * @param {string} storeName 仓库名称
 * @param {string} key 主键名称
 * @returns {object} 查询结果
 */
export function getDataByKey(db, storeName, key) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction([storeName], "readwrite");
        let objectStore = transaction.objectStore(storeName);
        const result = objectStore.get(key);
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
 * @param {object} db 数据库实例
 * @param {string} storeName 仓库名城管
 * @param {string} indexName 索引名称
 * @param {string} indexValue 索引值
 * @returns {object} 查询结果
 */
export function getDataByIndex(db, storeName, indexName, indexValue) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction([storeName], 'readwrite');
        let objectStore = transaction.objectStore(storeName);
        debugger
        let index = objectStore.index(indexName);
        const result = index.get(indexValue);
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
 * @param {object} db 数据库实例
 * @param {string} storeName 仓库名称
 * @returns {Array} 获取到的数据
 */
export function cursorGetData(db, storeName, query = null) {
    return new Promise((resolve, reject) => {

        let list = [];
        let transaction = db.transaction([storeName], "readwrite");
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
            console.log("游标查询失败！__ ^ _ ^__");
            reject(event.target.error);
        }

    })
}

/**
 * 更新数据库
 * @param {object} db 数据库实例
 * @param {string} storeName 仓库名称
 * @param {object} data 需要更新的数据
 */
export function updateData(db, storeName, data) {
    let transaction = db.transaction([storeName], "readwrite");
    let objectStore = transaction.objectStore(storeName);
    let result = objectStore.put(data);
    result.onsuccess = function() {
        console.log("更新数据成功！");
    }
    result.onerror = function() {
        console.log("更新数据失败！");
    }
}

/**
 * 通过主键删除数据
 * @param {object} db 数据库实例
 * @param {string} storeName 仓库名
 * @param {object} key 主键名称
 */
export function deleteData(db, storeName, key) {
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
// 清空指定数据库
export function clearStore(db, storeName) {
    let result = db.transaction([storeName], "readwrite").objectStore(storeName).clear();
    result.onsuccess = function() {
        console.log("清空数据库成功！");
    }
    result.onerror = function(event) {
        console.log("清空数据库失败，Error：", event.target.error);
    }
}

// 通过索引和游标删除指定的数据
export function cursorDeleteData(db, storeName, indexName, indexValue) {
    let store = db.transaction(storeName, 'readwrite').objectStore(storeName);

}