import { create } from "zustand";

type FulfillmentState = {
    mode: "collect" | "deliver" | null;
    postcode: string;
    houseNumber: string;
    addressConfirmed: boolean;

    setMode: (mode: "collect" | "deliver" | null) => void;
    setDeliveryAddress: (postcode: string, houseNumber: string) => void;
    confirmAddress: () => void;
    reset: () => void;
};

const useFulfillmentStore = create<FulfillmentState>((set) => ({
    mode: null,
    postcode: "",
    houseNumber: "",
    addressConfirmed: false,

    setMode: (mode) =>
        set({
            mode,
            addressConfirmed: false,
            ...(mode !== "deliver" ? { postcode: "", houseNumber: "" } : {}),
        }),

    setDeliveryAddress: (postcode, houseNumber) =>
        set({ postcode, houseNumber }),

    confirmAddress: () => set({ addressConfirmed: true }),

    reset: () =>
        set({
            mode: null,
            postcode: "",
            houseNumber: "",
            addressConfirmed: false,
        }),
}));

export default useFulfillmentStore;
