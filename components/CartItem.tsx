import { useCartStore } from "@/store/cart.store";
import { CartItemType } from "@/type";
import { Image, Text, TouchableOpacity, View } from "react-native";
import {images} from "@/constants";

const GROUP_LABELS: Record<string, string> = {
    meal: "Meal",
    meal_sides: "Sides",
    portion: "Portion",
    flavour: "Flavour",
    seasoning: "Seasoning",
    toppings: "Toppings",
    chicken_type: "Chicken",
    meat: "Meat",
    munchbox_burger: "Burger",
    munchbox_burger_flavour: "Burger flavour",
    munchbox_burger_seasoning: "Burger seasoning",
    munchbox_wings: "Wings & tenders",
    munchbox_wings_flavour: "Wings flavour",
    munchbox_wings_seasoning: "Wings seasoning",
    munchbox_loaded_fries: "Loaded fries",
    munchbox_bottomless: "Bottomless drink",
    platter_flavour: "Flavour",
    chips_or_rice: "Chips / Rice",
    can: "Drink",
    burger_options: "Burger options",
};

function formatCustomizations(customizations?: { id: string; name: string; price: number; type: string }[]): string {
    if (!customizations?.length) return "";
    const byType = new Map<string, string[]>();
    for (const c of customizations) {
        const arr = byType.get(c.type) ?? [];
        arr.push(c.name);
        byType.set(c.type, arr);
    }
    return Array.from(byType.entries())
        .map(([type, names]) => `${GROUP_LABELS[type] ?? type}: ${names.join(", ")}`)
        .join(" • ");
}

const CartItem = ({ item }: { item: CartItemType }) => {
    const { increaseQty, decreaseQty, removeItem } = useCartStore();
    const details = formatCustomizations(item.customizations);

    return (
        <View className="cart-item">
            <View className="flex flex-row items-center gap-x-3">
                <View className="cart-item__image">
                    <Image
                        source={{ uri: item.image_url }}
                        className="size-4/5 rounded-lg"
                        resizeMode="cover"
                    />
                </View>

                <View className="flex-1 min-w-0">
                    <Text className="base-bold text-dark-100">{item.name}</Text>
                    {details ? (
                        <Text className="text-xs text-gray-500 mt-1 leading-4" numberOfLines={3}>
                            {details}
                        </Text>
                    ) : null}
                    <Text className="paragraph-bold text-primary mt-1">
                        £{(Number(item.price) + (item.customizations?.reduce((s: number, c: any) => s + (c.price ?? 0), 0) ?? 0)).toFixed(2)}
                    </Text>

                    <View className="flex flex-row items-center gap-x-4 mt-2">
                        <TouchableOpacity
                            onPress={() => decreaseQty(item.id, item.customizations!)}
                            className="cart-item__actions"
                        >
                            <Image
                                source={images.minus}
                                className="size-1/2"
                                resizeMode="contain"
                                tintColor={"#FF9C01"}
                            />
                        </TouchableOpacity>

                        <Text className="base-bold text-dark-100">{item.quantity}</Text>

                        <TouchableOpacity
                            onPress={() => increaseQty(item.id, item.customizations!)}
                            className="cart-item__actions"
                        >
                            <Image
                                source={images.plus}
                                className="size-1/2"
                                resizeMode="contain"
                                tintColor={"#FF9C01"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => removeItem(item.id, item.customizations!)}
                className="flex-center"
            >
                <Image source={images.trash} className="size-5" resizeMode="contain" />
            </TouchableOpacity>
        </View>
    );
};

export default CartItem;
