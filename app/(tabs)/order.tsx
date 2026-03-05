import {
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Platform,
    ScrollView,
    KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useAppwrite from "@/lib/useAppwrite";
import { getCategories, getMenu } from "@/lib/appwrite";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import CartButton from "@/components/CartButton";
import cn from "clsx";
import MenuCard from "@/components/MenuCard";
import SearchBar from "@/components/SearchBar";
import Filter from "@/components/Filter";
import { Category, MenuItem } from "@/type";
import useFulfillmentStore from "@/store/fulfillment.store";
import { Image } from "react-native";
import { images } from "@/constants";

const Order = () => {
    const { category, query } = useLocalSearchParams<{ query: string; category: string }>();
    const {
        mode,
        postcode,
        houseNumber,
        addressConfirmed,
        setMode,
        setDeliveryAddress,
        confirmAddress,
    } = useFulfillmentStore();

    const { data, refetch, loading } = useAppwrite({
        fn: getMenu,
        params: { category, query, limit: 6 },
    });
    const { data: categories } = useAppwrite({ fn: getCategories });

    useEffect(() => {
        refetch({ category, query, limit: 6 });
    }, [category, query]);

    const showMenu = mode === "collect" || (mode === "deliver" && addressConfirmed);

    // Step 1: Choose Collect or Deliver
    if (!mode) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 px-5 pt-6">
                    <View className="flex-row justify-between items-center mb-8">
                        <View>
                            <Text className="small-bold uppercase text-primary">Order</Text>
                            <Text className="paragraph-semibold text-dark-100 mt-0.5">
                                How do you want to order?
                            </Text>
                        </View>
                        <CartButton />
                    </View>

                    <View className="gap-4 mt-4">
                        <TouchableOpacity
                            onPress={() => setMode("collect")}
                            className="w-full py-5 px-6 rounded-2xl bg-primary items-center"
                            style={Platform.OS === "android" ? { elevation: 4, shadowColor: "#878787" } : {}}
                        >
                            <Text className="paragraph-bold text-white">Click & Collect</Text>
                            <Text className="paragraph-regular text-white/90 mt-1">
                                Pick up from IQRA restaurant
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setMode("deliver")}
                            className="w-full py-5 px-6 rounded-2xl border-2 border-primary items-center"
                            style={Platform.OS === "android" ? { elevation: 2, shadowColor: "#878787" } : {}}
                        >
                            <Text className="paragraph-bold text-primary">Delivery</Text>
                            <Text className="paragraph-regular text-gray-200 mt-1">
                                We deliver to your address
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // Step 2 (Deliver only): Address entry
    if (mode === "deliver" && !addressConfirmed) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <ScrollView contentContainerClassName="px-5 pt-6 pb-20" keyboardShouldPersistTaps="handled">
                        <View className="flex-row justify-between items-center mb-6">
                            <TouchableOpacity onPress={() => setMode(null)}>
                                <Image source={images.arrowBack} className="size-6" resizeMode="contain" />
                            </TouchableOpacity>
                            <Text className="paragraph-bold text-dark-100">Delivery Address</Text>
                            <CartButton />
                        </View>

                        <Text className="paragraph-regular text-dark-100 mb-2">
                            Enter UK postcode or the first line of your address
                        </Text>
                        <TextInput
                            className="w-full py-4 px-4 rounded-xl border border-gray-200 bg-gray-50 mb-4"
                            placeholder="e.g. S7 2EF or Montrose Road"
                            placeholderTextColor="#A0A0A0"
                            value={postcode}
                            onChangeText={(t) => setDeliveryAddress(t, houseNumber)}
                            autoCapitalize="characters"
                        />

                        <Text className="paragraph-regular text-dark-100 mb-2">Building / House number</Text>
                        <TextInput
                            className="w-full py-4 px-4 rounded-xl border border-gray-200 bg-gray-50 mb-6"
                            placeholder="e.g. 12"
                            placeholderTextColor="#A0A0A0"
                            value={houseNumber}
                            onChangeText={(t) => setDeliveryAddress(postcode, t)}
                            keyboardType="number-pad"
                        />

                        <TouchableOpacity
                            onPress={confirmAddress}
                            disabled={!postcode.trim()}
                            className={cn(
                                "w-full py-4 rounded-xl items-center",
                                postcode.trim() ? "bg-primary" : "bg-gray-200"
                            )}
                        >
                            <Text
                                className={cn(
                                    "paragraph-bold",
                                    postcode.trim() ? "text-white" : "text-gray-400"
                                )}
                            >
                                Continue to menu
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // Step 3: Menu (Collect or Deliver after address confirmed)
    return (
        <SafeAreaView className="bg-white h-full">
            <FlatList
                data={data ?? []}
                keyExtractor={(item) => item.$id}
                renderItem={({ item, index }) => {
                    const isFirstRightColItem = index % 2 === 0;
                    return (
                        <View
                            className={cn("flex-1 max-w-[48%]", !isFirstRightColItem ? "mt-10" : "mt-0")}
                        >
                            <MenuCard item={item as unknown as MenuItem} />
                        </View>
                    );
                }}
                numColumns={2}
                columnWrapperClassName="gap-7"
                contentContainerClassName="gap-7 px-5 pb-32"
                ListHeaderComponent={() => (
                    <View className="my-5 gap-5">
                        <View className="flex-between flex-row w-full items-center">
                            <TouchableOpacity
                                onPress={() => setMode(null)}
                                className="flex-row items-center gap-2"
                            >
                                <Image source={images.arrowBack} className="size-5" resizeMode="contain" />
                                <View>
                                    <Text className="small-bold uppercase text-primary">Order</Text>
                                    <Text className="paragraph-semibold text-dark-100">
                                        {mode === "collect" ? "Click & Collect" : "Delivery"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <CartButton />
                        </View>

                        <SearchBar />
                        <Filter categories={(categories ?? []) as unknown as Category[]} />
                    </View>
                )}
                ListEmptyComponent={() => (!loading ? <Text>No Results</Text> : null)}
            />
        </SafeAreaView>
    );
};

export default Order;
