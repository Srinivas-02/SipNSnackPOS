import {create} from 'zustand';
import api from '../common/api';

interface User {
    id: number,
    email: string,
    first_name: string,
    last_name: string,
    is_super_admin: boolean,
    is_franchise_admin: boolean,
    is_staff_member: boolean
}

interface AccountState {
    user: User | null,
    setDetails: (user: User) => void,
}

const useAccountStore = create<AccountState>()((set) => ({
    user: null,
    setDetails: (user: User) => {
        set({ user });
    },
}));

export default useAccountStore;
