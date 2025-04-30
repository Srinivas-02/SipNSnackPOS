import { create } from 'zustand'

interface category{
    id: number,
    name: string,
    location_id: number,
    display_order : number,
    menu_items : menuitem[]
}

interface menuitem {
    id: number,
    name: string,
    price: number,
    category: string,
    location_id: number,
}

interface CategoryApiResponse{
    categories: category[]
}
interface MenuitemApiResponse{
    menu_items: menuitem[]
}

interface menuState{
    categories: category[],
    setCategories: (response: CategoryApiResponse) => void
    setMenuItems: (response: MenuitemApiResponse) => void
}

const useMenuStore = create<menuState>()((set) => ({
    categories: [],
    setCategories: (response: CategoryApiResponse) => {
        set(() => ({
            categories: response.categories.map(cat => ({
                ...cat,
                menu_items: []
            }))
        }))
    },
    setMenuItems: (response: MenuitemApiResponse) => {
        set((state) => {
            const categories: category[] = state.categories.map(cat => ({
                ...cat,
                menu_items: []
            }));

            response.menu_items.forEach(item => {
                const category = categories.find(cat => cat.name === item.category);
                if (category) {
                    category.menu_items.push(item);
                }
            });
            console.log('\n\n the categories are ', categories)
            return { categories };
        });
    }
}))

export default useMenuStore