import {create} from 'zustand'

interface location{
    id: number,
    name: string,
    city: string,
    state: string
}

interface LocationState{
    locations: location[],
    activeLocation: location | null,
    setLocations: (locations: location[]) => void
    setactiveLocation: (location_id: number) => void
}

const useLocationStore = create<LocationState>()((set) =>({
    locations: [],
    activeLocation: null,
    setLocations: (locations: location[]) => {
        set({
            locations: locations
        })
    },
    setactiveLocation: ( location_id) => {
        set((state) => ({
            activeLocation: state.locations.find(location => location.id === location_id) || null
        }))
    }
}))

export default useLocationStore