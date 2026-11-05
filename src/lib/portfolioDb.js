const DB_NAME = 'wzy-portfolio'
const DB_VERSION = 3
const STORE_NAME = 'projects'
const SHOWCASE_STORE_NAME = 'showcase'
const SETTINGS_STORE_NAME = 'settings'

function requestAsPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt')
      }
      if (!database.objectStoreNames.contains(SHOWCASE_STORE_NAME)) {
        const store = database.createObjectStore(SHOWCASE_STORE_NAME, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt')
      }
      if (!database.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
        database.createObjectStore(SETTINGS_STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore(storeName, mode, operation) {
  const database = await openDatabase()

  try {
    const transaction = database.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    const completion = new Promise((resolve, reject) => {
      transaction.oncomplete = resolve
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
    const result = await operation(store)
    await completion
    return result
  } finally {
    database.close()
  }
}

export function getAllProjects() {
  return withStore(STORE_NAME, 'readonly', async (store) => {
    const projects = await requestAsPromise(store.getAll())
    return projects.sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
  })
}

export function putProject(project) {
  return withStore(STORE_NAME, 'readwrite', (store) =>
    requestAsPromise(store.put(project)),
  )
}

export function removeProject(id) {
  return withStore(STORE_NAME, 'readwrite', (store) =>
    requestAsPromise(store.delete(id)),
  )
}

export function getAllShowcaseItems() {
  return withStore(SHOWCASE_STORE_NAME, 'readonly', async (store) => {
    const items = await requestAsPromise(store.getAll())
    return items.sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
  })
}

export function putShowcaseItems(items) {
  return withStore(SHOWCASE_STORE_NAME, 'readwrite', async (store) => {
    await Promise.all(items.map((item) => requestAsPromise(store.put(item))))
  })
}

export function removeShowcaseItem(id) {
  return withStore(SHOWCASE_STORE_NAME, 'readwrite', (store) =>
    requestAsPromise(store.delete(id)),
  )
}

export function clearShowcaseItems() {
  return withStore(SHOWCASE_STORE_NAME, 'readwrite', (store) =>
    requestAsPromise(store.clear()),
  )
}

export function getSetting(id) {
  return withStore(SETTINGS_STORE_NAME, 'readonly', (store) =>
    requestAsPromise(store.get(id)),
  )
}

export function putSetting(setting) {
  return withStore(SETTINGS_STORE_NAME, 'readwrite', (store) =>
    requestAsPromise(store.put(setting)),
  )
}

export function removeSetting(id) {
  return withStore(SETTINGS_STORE_NAME, 'readwrite', (store) =>
    requestAsPromise(store.delete(id)),
  )
}
