import { UserStore } from './dataStore';

function getUsersStore() {
    return UserStore.getInstance();
}

export async function getUsers() {
    return await getUsersStore().getUsers();
}


